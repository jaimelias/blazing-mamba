'use strict';
var fs = require('hexo-fs');
var CleanCSS = require('clean-css');
var assign = require('object-assign');
var algoliasearch = require('algoliasearch');
var client = algoliasearch("47Q1KIRCHF", "9a270bdc08cc20f4290e046efe0f98d3");
var index = client.initIndex('mamba');
var math = require('mathjs');

hexo.extend.console.register('algolia', 'Clear Algolia Index', function(args){
	
	index.clearIndex(function(err, content) {
	  console.log(content);
	});
	
	var source = fs.readFileSync('db.json', {encoding: 'utf8'});
	source = JSON.parse(source);
	source = source.models.Page;
	var output = [];
	
	Object.keys(source).forEach(function(page){
		
		var data = source[page];
		
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
				
					if(Object.keys(data.events[0]).length > 0)
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
	});
	
	setTimeout(function(){
		index.addObjects(output, function(err, content) {
			console.log(content.objectIDs.length + ' objects added to Algolia.');
		});										
	}, 600);	
	
});

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