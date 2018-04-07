function toggleEvent(event_id)
{
	var event_body = document.getElementById("event-body-"+event_id);
	var event_send = document.getElementById("event-send-"+event_id);
	var event_show = document.getElementById("event-show-"+event_id);
	event_body.classList.toggle('hidden');
	event_send.classList.toggle('hidden');
	event_show.classList.toggle('hidden');
	return false;
}
function toggleExtras(event_id)
{
	var event_addons = document.getElementById("event-addons-"+event_id);
	event_addons.classList.toggle('hidden');
	return false;
}

function booking_submit(event_id)
{
	var event_form = document.getElementById("event-"+event_id);
	var fields = event_form.querySelectorAll("input, select, textarea");
	var output = {};
	var invalid = 0;
	
	for(var x = 0; x < fields.length; x++)
	{
		var field_value = fields[x].value;
		
		if(fields[x].value == '')
		{
			console.log(fields[x]);
			fields[x].classList.add('validation_error');
			invalid++;
		}
		else
		{
			if(fields[x].value != '--')
			{
				if(hasClass(fields[x], 'addon'))
				{
					//do nothing
				}
				else
				{
					output[fields[x].name] = field_value;
				}
			}
			else
			{
				console.log(fields[x]);
				fields[x].classList.add('validation_error');
				invalid++;
			}			
		}
	}
	
	console.log(invalid);
	console.log(output);
}

function calculate_total(event_id)
{
	var participants = 0;
	var base_price = document.getElementById('event-json').innerHTML;
	var event_form = document.getElementById('event-' + event_id);
	var participants = document.getElementById('event-participants-' + event_id).value;
	participants = participants != '--' ? parseInt(participants) : 0;
	
	try
	{
		base_price = JSON.parse(base_price);
	}
	catch(e)
	{
		console.log(e);
	}

	base_price = base_price ? parseFloat(base_price) : 0;
	var output = base_price;	
	var event_price = document.getElementById('event-json-' + event_id).innerHTML;
	
	try
	{
		event_price = JSON.parse(event_price);
	}
	catch(e)
	{
		console.log(e);
	}
	
	event_price = event_price.price;
	
	if(Array.isArray(event_price))
	{
		//do nothing
	}
	else
	{
		//do  nothing
		output = output + (event_price * participants);
	}
	
	console.log(output);
}