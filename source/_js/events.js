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

function calculate_vars(event_id)
{
	var obj = {};
	obj.items = [];
	var total = 0;
	var template = Hogan.compile(document.getElementById('breakdown-template').innerHTML);
	var json = JSON.parse(document.getElementById('event-json-' + event_id).innerHTML);
	var participants = document.getElementById('event-participants-' + event_id).value;
	participants = participants != '--' ? parseInt(participants) : 0;	
	total = json.base_price + (json.event_price * participants);
	
	
	if(json.base_price > 0)
	{
		var base = {};
		base.description = json.title;
		base.quantity = 1;
		base.price = json.base_price;
		base.subtotal = json.base_price;
		obj.items.push(base);		
	}
	
	var item = {};
	item.description = json.name;
	item.quantity = participants;
	item.price = json.event_price;
	item.subtotal = json.event_price * participants;
	obj.items.push(item);

	[].forEach.call(document.getElementsByClassName('addon-'+event_id), function (el, index) {
		
		var item = {};
		item.quantity = el.value;
		
		if(item.quantity > 0)
		{
			
			item.description = json.addons[index].name;
			item.price = json.addons[index].price;
			item.subtotal = item.quantity * item.price;
			total = total + (item.subtotal);
			obj.items.push(item);
		}

	});
		
	obj.total = total;
	obj.participants = participants;
	
	[].forEach.call(document.getElementsByClassName('event-breakdown-'+event_id), function (el) {
		el.innerHTML = template.render(obj);
	});	
}