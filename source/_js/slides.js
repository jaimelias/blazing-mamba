
[].forEach.call(document.getElementsByClassName('slideshow'), function (slide) {
	
	var item = slide.querySelectorAll('.slides');
	
	if(item.length > 0)
	{
		console.log(item);
		//https://www.w3schools.com/howto/howto_js_slideshow.asp
	}
});