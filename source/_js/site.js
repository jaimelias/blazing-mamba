function toggleMenu()
{
	var menu = document.querySelector('#menuToggled');
	menu.classList.toggle('toggled');
}

function show_modal()
{
	[].forEach.call(document.getElementsByClassName('modal'), function (el) {
		el.classList.remove('hidden');
	});		
}
function google_async(UA)
{
	window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
	ga('create', UA, 'auto');
	ga('send', 'pageview');	
}

