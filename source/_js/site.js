function toggleMenu()
{
	var menu = document.querySelector('#menuToggled');
	menu.classList.toggle('toggled');
}

function show_modal()
{
	[].forEach.call(document.getElementsByClassName('modal'), function (el) {
		el.classList.toggle('hidden');
	});	
	return false;
}
function google_async(UA)
{
	window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
	ga('create', UA, 'auto');
	ga('send', 'pageview');	
}
function hasClass(e, c) {
    return (' ' + e.className + ' ').indexOf(' ' + c + ' ') > -1;
}
