'use strict';
var fs = require('hexo-fs');
var algoliasearch = require('algoliasearch');
var client = algoliasearch("47Q1KIRCHF", "9a270bdc08cc20f4290e046efe0f98d3");
var index = client.initIndex('mamba');
var https = require('https');
var async = require('async');
var marked = require('marked');
var Airtable = new airtable();

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] == value) {
            return array[i];
        }
    }
    return null;
}
function airtable()
{
	var obj = {};
	obj.base = 'appYSn27QMGfiy84u';
	obj.api = 'keyrZXftjEXBf4jh7';
	obj.views = {};
	obj.views.packages = 'Packages';
	obj.views.sub_packages = 'Sub Packages';
	obj.views.add_ons = 'Add-ons';
	obj.views.categories = 'Categories';
	obj.views.spaces = 'Spaces';
	obj.url = function(view){
		return encodeURI('https://api.airtable.com/v0/'+this.base+'/'+view+'?api_key='+this.api);
	};
	return obj;
}

hexo.on('generateBefore', function(){

	try
	{
		var pages = hexo.locals.get('pages').data;
		pages = JSON.parse(JSON.stringify(pages));		
		var source = fs.readFileSync('airtable.json', {encoding: 'utf8'});
		source = JSON.parse(source);
				
		for(var x = 0; x < source.length; x++)
		{
			pages.push(source[x]);
		}
		
		for(var p = 0; p < pages.length; p++)
		{
			if(pages[p].hasOwnProperty('_content'))
			{
				if(pages[p]._content != '')
				{
					console.log("## Markdown is Active for pages");
					pages[p]._content = marked(pages[p]._content);
				}
				else
				{
					pages[p]._content = '';
				}
			}
			else
			{
				pages[p]._content = '';
			}
		}
		hexo.locals.set('pages', function(){
			return pages;
		});			
	}catch(e)
	{
		console.log(e.message);  
	}
});


hexo.extend.console.register('airtable', 'Clear Algolia Index', function(args){
	
	var urls = [];
	urls.push(Airtable.url(Airtable.views.packages));
	urls.push(Airtable.url(Airtable.views.sub_packages));
	urls.push(Airtable.url(Airtable.views.add_ons));
	urls.push(Airtable.url(Airtable.views.categories));
	urls.push(Airtable.url(Airtable.views.spaces));
	
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
		
		var input = {};	
		var output = [];
				
		for(var x = 0; x < responses.length; x++)
		{
			responses[x] = JSON.parse(responses[x]).records;
			
			if(x == 0)
			{
				input.packages = responses[x];
			}
			if(x == 1)
			{
				input.sub_packages = responses[x];
			}
			if(x == 2)
			{
				input.add_ons = responses[x];
			}
			if(x == 3)
			{
				input.categories = responses[x];
			}
			if(x == 4)
			{
				input.spaces = responses[x];
			}			
		}


		for(var y = 0; y < input.sub_packages.length; y++)
		{
			if(input.sub_packages[y].fields.hasOwnProperty('add_ons'))
			{
				var add_ons = [];
				
				for(var i = 0; i < input.sub_packages[y].fields.add_ons.length; i++)	
				{
					var item = findObjectByKey(input.add_ons, 'id', input.sub_packages[y].fields.add_ons[i]);
					item = item.fields;
					add_ons.push(item);
				}
				input.sub_packages[y].fields.add_ons =  add_ons;
			}
			if(input.sub_packages[y].fields.hasOwnProperty('includes'))
			{
				if(typeof input.sub_packages[y].fields.includes === 'string')
				{
					if(input.sub_packages[y].fields.includes != '')
					{
						var includes = input.sub_packages[y].fields.includes.split('\n');
						input.sub_packages[y].fields.includes = includes;
					}
				}
			}
			if(input.sub_packages[y].fields.hasOwnProperty('spaces'))
			{
				var spaces = [];
				for(var i = 0; i < input.sub_packages[y].fields.spaces.length; i++)
				{
					var item = findObjectByKey(input.spaces, 'id', input.sub_packages[y].fields.spaces[i]);
					item = item.fields;
					spaces.push(item);
				}
				input.sub_packages[y].fields.spaces =  spaces;
			}
			if(input.sub_packages[y].fields.hasOwnProperty('thumbnail'))
			{
				input.sub_packages[y].fields.gallery = [];
				
				for(var k in input.sub_packages[y].fields)
				{	
					if(typeof input.sub_packages[y].fields[k] === 'string')
					{	
						if(k.match(/slide/i))
						{
							input.sub_packages[y].fields.gallery.push(input.sub_packages[y].fields[k].replace(/http\:/, 'https:'));
							delete input.sub_packages[y].fields[k];
						}
					}
				}	
			}
		}
														
		for(var x = 0; x < input.packages.length; x++)
		{
			if(input.packages[x].fields.hasOwnProperty('sub_packages'))
			{
				var sub_packages = [];
				for(var y = 0; y < input.packages[x].fields.sub_packages.length; y++)
				{
					var item = findObjectByKey(input.sub_packages, 'id', input.packages[x].fields.sub_packages[y]);
					item = item.fields;
					
					if(item.hasOwnProperty('thumbnail'))
					{
						item.thumbnail = item.thumbnail.replace(/http\:/, "https:");
					}
										
					sub_packages.push(item);
				}		
				input.packages[x].fields.sub_packages = sub_packages;					
			}
			if(input.packages[x].fields.hasOwnProperty('categories'))
			{	
				var categories = [];
				for(var c = 0; c < input.packages[x].fields.categories.length; c++)
				{

					var item = findObjectByKey(input.categories, 'id', input.packages[x].fields.categories[c]);
					item = item.fields.name;
					categories.push(item);
				}
				input.packages[x].fields.categories = categories;
			}
		}		
		
		
		for(var e = 0; e < input.packages.length; e++)
		{
			var item = input.packages[e].fields;
			
			
			item.gallery = [];
			
			for(var k in item)
			{	
				if(typeof item[k] === 'string')
				{	
					if(k.match(/slide/i))
					{
						item.gallery.push(item[k].replace(/http\:/, 'https:'));
						delete item[k];
					}
				}
			}			
			
			if(item.hasOwnProperty('sub_packages'))
			{
				if(item.sub_packages.length > 0)
				{
					var item = input.packages[e].fields;
					item.algolia = true;
					item.layout = 'page';
					item.path = string_to_slug(input.packages[e].fields.title)+'/index.html';
					item.date = '';
					item._id = input.packages[e].id;
					item._content = input.packages[e].fields.content;
					
					if(item.hasOwnProperty('thumbnail'))
					{
						item.thumbnail = item.thumbnail.replace(/http\:/, "https:");
					}
					
					delete input.packages[e].fields.content;
					output.push(item);				
					
				}
			}
			else
			{
				console.log(item.title + ' has no sub_packages');
			}
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

				var path = 'airtable.json';
				fs.writeFileSync(path, JSON.stringify(output), {encoding: 'utf8'});		
			}
		}
		else
		{
			console.log('No Packages Found');
		}			
	});	
});

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
							obj.thumbnail = data.thumbnail;
						}
					}				
					
					obj.description = data.description;
					obj.categories = data.categories;
									
					if(data.hasOwnProperty('price'))
					{
						if(typeof data.price == 'number')
						{
							price = data.price;
						}
					}
								
					if(data.hasOwnProperty('sub_packages'))
					{	
						if(data.sub_packages.length > 0)
						{
							if(data.sub_packages[0].hasOwnProperty('price'))
							{
									obj.per_person = true;
									
									if(price > 0)
									{
										price = (price / data.sub_packages[0].max_capacity);
									}
									price = price + data.sub_packages[0].price;
									
									if(data.sub_packages[0].hasOwnProperty('spaces'))
									{
										price = price + (data.sub_packages[0].spaces[0].price/data.sub_packages[0].max_capacity);
									}	
							}
							else
							{
								console.log(data.title + ' has no price');
							}
						}						
					}
					
					obj.price = parseInt(price);
					output.push(obj);						
				}			
			}		
		}		
	}
	
	return output;
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