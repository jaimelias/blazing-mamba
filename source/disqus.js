function disqus_async(disqus_user)
{
	if(document.getElementById('disqus_thread'))
	{		
		(function() {
			var d = document, s = d.createElement('script');
			s.src = 'https://' + disqus_user + '.disqus.com/embed.js';
			s.setAttribute('data-timestamp', +new Date());
			(d.head || d.body).appendChild(s);
		})();		
	}	
}