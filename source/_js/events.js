function toggleEvent(event_id)
{
	var event_body = document.getElementById("event-body-"+event_id);
	var event_send = document.getElementById("event-send-"+event_id);
	var event_show = document.getElementById("event-show-"+event_id);
	event_body.classList.toggle('hidden');
	event_send.classList.toggle('hidden');
	event_show.classList.toggle('hidden');
}