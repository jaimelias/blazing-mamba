'use strict';
var fs = require('hexo-fs');
var CleanCSS = require('clean-css');
var assign = require('object-assign');
var algoliasearch = require('algoliasearch');
var client = algoliasearch("47Q1KIRCHF", "9a270bdc08cc20f4290e046efe0f98d3");
var index = client.initIndex('mamba');
var math = require('mathjs');
var request = require('request');
var https = require('https');
var async = require('async');
var Zoho = new zoho();

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            return array[i];
        }
    }
    return null;
}

function zoho()
{
	var obj = {};
	obj.app_name = 'mamba';
	obj.url = 'https://creator.zoho.com/api/json/'+obj.app_name+'/view/';	
	obj.views = {};
	obj.views.packages = 'All_Packages';
	obj.views.sub_packages = 'All_Sub_Packages';
	obj.views.add_ons = 'All_Add_ons';
	var params = {};
	params.authtoken = 'e6abd5db9451b20d45cb15ada824ed97';
	params.zc_ownername = 'panamajethub';
	params.scope = 'creatorapi';
	params.raw = true;
	obj.params = Object.keys(params).map(key => key + '=' + params[key]).join('&');	
	obj.fix_rel = function(string){
		if(string != '[]')
		{
			return string.replace(/[\[\]']+/g,'').split(', ');
		}
		else
		{
			return [];
		}
	};
	return obj;
}

hexo.on('generateBefore', function(){

	var source = fs.readFileSync('zoho.json', {encoding: 'utf8'});
	source = JSON.parse(source);
	var pages = hexo.locals.get('pages').data;
	pages = JSON.parse(JSON.stringify(pages));
	
	for(var x = 0; x < source.length; x++)
	{
		pages.push(source[x]);
	}
		
	hexo.locals.set('pages', function(){
		return pages;
	});	
});

hexo.extend.console.register('zoho', 'Clear Algolia Index', function(args){
	zoho_run();
});

function zoho_run()
{
	var urls = [];
	urls.push(Zoho.url + Zoho.views.packages+'?'+Zoho.params);
	urls.push(Zoho.url + Zoho.views.sub_packages+'?'+Zoho.params);
	urls.push(Zoho.url + Zoho.views.add_ons+'?'+Zoho.params);
	
	async.map(urls, function(url, cb) {
	  https.get(url, function(res) {
		var buf = '';
		res.on('data', function(d) {
		  buf += d;
		}).on('end', function() {
		  cb(null, buf);
		});
	  });
	}, function(err, responses) {
		zoho_packages(responses[0], responses[1], responses[2]);
	});	
}

function zoho_packages(packages, sub_packages, addons)
{	
	var output = [];
	packages = JSON.parse(packages);
	packages = packages.Paquetes
	sub_packages = JSON.parse(sub_packages);
	sub_packages = sub_packages.Sub_Packages;
	addons = JSON.parse(addons);
	addons = addons.Add_ons;

	for(var x = 0; x < packages.length; x++)
	{
		var obj = {};
		obj.algolia = true;
		obj.title = packages[x].title;
		obj.magnetic_title = packages[x].magnetic_title;
		
		if(packages[x].magnetic_title == '')
		{
			obj.magnetic_title = packages[x].title;
		}		
		
		obj.layout = 'page';
		obj.date = '';
		obj._id = packages[x].ID;
		obj.path = string_to_slug(packages[x].title)+'/index.html';
		obj.price = packages[x].price;
		obj.description = packages[x].description;
		obj._content = packages[x].content;
		obj.events = [];
		obj.type = Zoho.fix_rel(packages[x].Types);
		obj.thumbnail = packages[x].thumbnail;
			
		for(var s = 0; s < Zoho.fix_rel(packages[x].Sub_Packages).length; s++)
		{
			var name = Zoho.fix_rel(packages[x].Sub_Packages)[s];
			var sub = findObjectByKey(sub_packages, 'name', name);
						
			if(sub != null)
			{
				obj.events.push(sub);
			}	
		}
		
		for(var e = 0; e < obj.events.length; e++)
		{
			var name = Zoho.fix_rel(obj.events[e].Add_ons);
			var add = findObjectByKey(addons, 'name', name);
			obj.events[e].addons = [];
			
			var includes = '';
			
			if(typeof obj.events[e].includes === 'string')
			{
				if(obj.events[e].includes != '')
				{
					includes = obj.events[e].includes.split('\n');
				}
			}
			
			obj.events[e].includes = includes;
				
			if(add != null)
			{
				obj.events[e].addons.push(add);				
			}
		}
		output.push(obj);
	}
	
	if(output.length > 0)
	{
		if(output[0].algolia == true)
		{
			index.clearIndex(function(err, content) {
			  console.log(content);
			});	
	
			index.addObjects(filter_algolia(output), function(err, content) {
				console.log(content.objectIDs.length + ' objects added to Algolia.');
			});	

			var path = 'zoho.json';
			fs.writeFileSync(path, JSON.stringify(output), {encoding: 'utf8'});		
		}
	}
	else
	{
		console.log('No Packages Found');
	}
}


function filter_algolia(json)
{
	var output = [];

	for(var x = 0; x < json.length; x++)
	{
		
		var data = json[x];
		
		if(data.layout == 'page')
		{
			if(data.hasOwnProperty('algolia'))
			{
				if(data.algolia == true)
				{
					var obj = {};
					var price = 0;
					obj.title = data.title;
					obj.date = parseInt((new Date(data.date).getTime() / 1000).toFixed(0));
					obj.path = data.path.replace(/index\.html/i, '');
					
					obj.thumbnail = '/images/bg-logo.svg';
					
					if(data.hasOwnProperty('thumbnail'))
					{
						if(data.thumbnail)
						{
							obj.thumbnail = '/images/' + data.thumbnail;
						}
					}				
					
					obj.description = data.description;
					obj.type = data.type;
									
					if(data.hasOwnProperty('price'))
					{
						if(typeof data.price == 'number')
						{
							price = data.price;
						}
					}
				
					if(data.events.length > 0)
					{
						if(data.events[0].price)
						{
							if(data.events[0].min_capacity && data.events[0].max_capacity)
							{
								if(price > 0)
								{
									price = (price / data.events[0].max_capacity);
								}
								price = price + data.events[0].price;
								obj.price = parseInt(price);
							}
							else
							{
								console.log(data.title + 'has capacity error');
							}
						}
						else
						{
							console.log(data.title + 'has no price');
						}
					}
	
					output.push(obj);						
				}			
			}		
		}		
	}
	
	return output;
}

hexo.extend.helper.register('blaz', blaz_core);


hexo.on('generateBefore', function(){
	hexo.theme.stylesheets = assign({}, hexo.theme.stylesheets, blaz_style(this.theme.config));
	hexo.theme.javascript = assign({}, hexo.theme.javascript, blaz_javascript(this.theme.config));
});

function blaz_core()
{
	var output = {};
	output.title = blaz_title(this.config, this.page, this.__, this.theme);
	output.canonical = blaz_canonical(this.config, this.path);
	output.site = blaz_site(this.config);
	return output;
}

function blaz_site(config)
{
	var output = {};
	output.domain = get_domain(config.url);
	return output;
}
function blaz_canonical(config, path)
{
	var output = config.url;
	
	if (output.charAt(config.url.length - 1) !== '/')
	{
		output += '/';
	}
	
	path = path.replace('index.html', '');
	output += path;
	
	return output;
}

function blaz_style(theme)
{
	var output = {};
	
	//console.log(theme);
	
	Object.keys(theme.stylesheets).forEach(function(key){
		
		if(theme.stylesheets[key].constructor === Array)
		{			
			var css2txt = "";
			
			for(var x = 0; x < theme.stylesheets[key].length; x++)
			{
				var source = fs.readFileSync('themes/blazing-mamba/source/_css/'+theme.stylesheets[key][x], {encoding: 'utf8'});
				css2txt += source;
			}
						
			//for production
			var clean_css = new CleanCSS({level: 1}).minify(css2txt);		
			output[key] = clean_css.styles;
		}
	});

	theme.css = assign({}, theme.css, output);
}

function blaz_javascript(theme)
{
	var output = {};
		
	Object.keys(theme.local_scripts).forEach(function(key){
		
		if(theme.local_scripts[key].constructor === Array)
		{			
			var script = "";
			
			for(var x = 0; x < theme.local_scripts[key].length; x++)
			{
				var source = fs.readFileSync('themes/blazing-mamba/source/_js/'+theme.local_scripts[key][x], {encoding: 'utf8'});
				script += source;
			}		
			output[key] = script;
		}
	});

	theme.javascript = assign({}, theme.javascript, output);
}

function blaz_title(config, page, i18n, theme)
{
	var output = [];
	
	output.push(config.title);	
	
	if(typeof page.archive === 'undefined' && typeof page.category === 'undefined' && typeof page.tag === 'undefined')
	{
		if(page.current > 1)
		{
			output.unshift(i18n('page', page.current));
		}
		else if(page.current == 1)
		{
			if(config.hasOwnProperty('subtitle'))
			{
				if(config.subtitle != null)
				{
					output.push(config.subtitle);
				}
			}
		}
	}
	
	if(page.hasOwnProperty('title'))
	{
		if(page.hasOwnProperty('algolia'))
		{
			if(page.algolia == true)
			{
				output.unshift(page.magnetic_title);
			}
			else
			{
				output.unshift(page.title);
			}
		}
		else
		{
			output.unshift(page.title);
		}
	}
	if(page.hasOwnProperty('category'))
	{
		output.unshift(page.category);
	}
	if(page.hasOwnProperty('tag'))
	{
		output.unshift(page.tag);
	}
	if(page.hasOwnProperty('archive'))
	{
		
		if(theme.hero.blog.enable == true)
		{
			output.unshift(theme.hero.blog.title);
		}
		else
		{
			if(page.hasOwnProperty('year'))
			{
				output.unshift(i18n('archive_b', page.year + (page.month ? '/' + page.month : '')));
			}
			else
			{
				output.unshift(i18n('archive_a'));
			}
		}		
	}
	
	return output.join(' | ');	
}


function get_domain(url) {
	
    var hostname;
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    return hostname;
}

function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

    return str;
}