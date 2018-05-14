'use strict';
var fs = require('hexo-fs');
var algoliasearch = require('algoliasearch');
var client = algoliasearch("47Q1KIRCHF", "9a270bdc08cc20f4290e046efe0f98d3");
var index = client.initIndex('mamba');
var https = require('https');
var async = require('async');
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
	obj.url = function(view){
		return encodeURI('https://api.airtable.com/v0/'+this.base+'/'+view+'?api_key='+this.api);
	};
	return obj;
}

hexo.extend.console.register('airtable', 'Clear Algolia Index', function(args){
	
	var urls = [];
	urls.push(Airtable.url(Airtable.views.packages));
	urls.push(Airtable.url(Airtable.views.sub_packages));
	urls.push(Airtable.url(Airtable.views.add_ons));
	
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
					sub_packages.push(item);
				}		
				delete input.packages[x].fields.sub_packages;
				input.packages[x].fields.sub_packages = sub_packages;
			}
		}
		
		console.log(JSON.stringify(input));
		
		
	});
	
	
});