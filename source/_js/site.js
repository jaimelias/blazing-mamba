function toggleMenu()
{
	var menu = document.querySelector('#menuToggled');
	menu.classList.toggle('toggled');
}
function show_modal(the_id)
{
	document.getElementById(the_id).classList.toggle('hidden');
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
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
function date_picker()
{	
	[].forEach.call(document.getElementsByClassName('datepicker'), function (el) {
		el.DatePickerX.init({
		mondayFirst: true
		});	
	});	
}