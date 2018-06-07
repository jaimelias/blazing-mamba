var slideIndex = 0;

function plusSlides(n, id) {	
    showDivs((slideIndex += n), id);
}

function showDivs(n, id) {

	var slideshow = document.getElementById(id);
	var x = slideshow.querySelectorAll('.slides');
	
	if(x.length > 0)
	{
		
		if (n > x.length)
		{
			slideIndex = 1;
		}
		if (n < 1)
		{
			slideIndex = x.length;
		}
		
		for (var i = 0; i < x.length; i++)
		{
			x[i].style.display = 'none'; 
		}
		
		x[slideIndex-1].style.display = 'block';
	}
}
