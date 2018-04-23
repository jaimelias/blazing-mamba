document.getElementById("packages-link").addEventListener("click", function(event){
    var page = window.location.pathname;
	
	if(page == '/')
	{
		 event.preventDefault();
	}
	
	focus_searchbox();
	
	console.log(event);
	
});


function check_hash()
{	
	if(window.location.hash == '#search-box')
	{
		return true;
	}
}

function focus_searchbox()
{	
	var doc = document.documentElement;
	var offset = getOffset( document.getElementById('search-box') ).top;
	offset = offset - 100;
	document.documentElement.scrollTop = document.body.scrollTop = offset;
	var count = 0;

	[].forEach.call(document.getElementsByClassName('ais-search-box--input'), function (el) {
		if(count == 0)
		{
			el.focus();
			count++;
		}	
	});		
	
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}


function async_instantsearch(){
	
	const search = instantsearch({
	  appId: '47Q1KIRCHF',
	  apiKey: '6a3e83e893a787495219520b04be46ca',
	  indexName: 'mamba'
	});

	search.addWidget(
		instantsearch.widgets.hits({
			container: '#hits',
			templates: {
				empty: '<div class="empty hits-filter"><h1>No Results for <span class="light">{{query}}</span></h1></div>',
				item: document.getElementById('hit-template').innerHTML
			},
			cssClasses: {
				item: 'block bottom-20',
				root: 'clearfix'
			}			
		})
	);

	search.addWidget(
		instantsearch.widgets.searchBox({
			container: '#search-box',
			placeholder: 'despedidas de solteras, party bus, fiestas...',
			reset: false,
			autofocus: false,
			cssClasses: {
				input: 'width-100 border-box'
			}
		})
	);

	search.addWidget(
		instantsearch.widgets.refinementList({
			container: '#type-container',
			attributeName: 'type',
			templates: {
			  header: 'Tipo de paquete'
			},
			cssClasses: {
				header: 'uppercase light small bottom-5',
				label: 'strong pointer',
				item: 'bottom-5'
			}			
		})
	);

	search.addWidget(
	  instantsearch.widgets.rangeSlider({
		container: '#price-container',
		attributeName: 'price',
		autoHideContainer: false,
		cssClasses: {
			root: 'width-100 clearfix'
			},
		tooltips: {
		  format: function(rawValue) {
			return '$' + Math.round(rawValue).toLocaleString();
		  }
		}
	  })
	);

	search.addWidget(
	  instantsearch.widgets.clearAll({
		container: '#clear-all',
		templates: {
		  link: 'Borrar filtros'
		},
		cssClasses: {
			link: 'pure-button button-xs'
		},		
		autoHideContainer: false,
		clearsQuery: true,
	  })
	);

	search.addWidget(
	  instantsearch.widgets.pagination({
		container: '#pagination-container',
		cssClasses: {
			link: 'pure-button'
		},		
		maxPages: 6,
		scrollTo: false,
		showFirstLast: false,
	  })
	);
	
	search.addWidget(
	  instantsearch.widgets.sortBySelector({
		container: '#sort-by-container',	
		indices: [
		  {name: 'mamba', label: 'Más relevante'},
		  {name: 'mamba_price_asc', label: 'Precio más bajo'},
		  {name: 'mamba_price_desc', label: 'Precio más alto'}
		],
		cssClasses: {
			select: 'width-100'
		}		
	  })
	);	

	search.start();
	
	if(check_hash())
	{
		focus_searchbox();
	}
}