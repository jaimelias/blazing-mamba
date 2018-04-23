fill_hours();

function date_picker()
{	
	[].forEach.call(document.getElementsByClassName('datepicker'), function (el) {
		el.DatePickerX.init({
		mondayFirst: true
		});	
	});	
}

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
	merge_addons(event_id);
	calculate_total(event_id);
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
	
	output.webhook = event_form.getAttribute('data-webhook');
	output.url = event_form.getAttribute('data-url');
	
	console.log(invalid);
	console.log(output);
	
	if(invalid == 0)
	{
		ajax_post(output);
	}
	
}

function merge_addons(event_id)
{
	var event_form = document.getElementById("event-"+event_id);
	var fields = event_form.querySelectorAll("select.addon");
	var output = '';
	
	for(var x = 0; x < fields.length; x++)
	{
		if(parseInt(fields[x].value) > 0)
		{
			var item = '';
			
			if(x > 0)
			{
				item += '\n';
			}
			item += fields[x].getAttribute('data-name');
			item += ': ';
			item += fields[x].value;
			output += item;			
		}
	}
	[].forEach.call(document.getElementsByName('addons'), function (el) {
		if(output != '')
		{
			el.innerHTML = output;
		}
	});
}
function calculate_total(event_id)
{
	var total = 0;
	var json = JSON.parse(document.getElementById('event-json-' + event_id).innerHTML);
	var participants = document.getElementById('event-participants-' + event_id).value;	
	total = json.base_price + (json.event_price * participants);
	
	[].forEach.call(document.getElementsByClassName('addon-'+event_id), function (el, index) {
		
		if(parseInt(el.value) > 0)
		{
			total = total + (el.value * json.addons[index].price);
		}
	});	
	
	[].forEach.call(document.getElementsByName('price'), function (el) {
		el.value = total;
	});
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

function fill_hours()
{
	var output = '<select>--</select>';
	var min = 1;
	var max = 24;
	max = max + 1;
	var hours = [];
	
	for(var x = min; x < max; x++)
	{
		hours.push(x);
	}

	for(var x = 0; x < hours.length; x++)
	{
		
		[].forEach.call(document.getElementsByName('hour'), function (option) {

			var hour = parseFloat(hours[x]);
			
			if(hour < 12)
			{
				if(hour < 1)
				{
					hour = 12;
				}
				if(hour < 10)
				{
					hour = '0'+hour;
				}
				hour = hour + ':00 AM';
			}
			else if(hour == 24)
			{
				hour = hour - 12;
				hour = hour + ':00 AM';
			}
			else
			{
				if(hour > 12)
				{
					hour = hour - 12;
				}
				if(hour < 10)
				{
					hour = '0'+hour;
				}
				hour = hour + ':00 PM';
			}
			
			var item = document.createElement('option');
			item.text = hour;
			item.value = hour;
			option.add(item);
		});		
	}
}

function ajax_post(json)
{
	var webhook = json.webhook;
	xhr = new XMLHttpRequest();
	xhr.open('POST', b64DecodeUnicode(webhook));
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.onload = function(){
		if (xhr.status === 200)
		{
			console.log(xhr.responseText);
			show_modal('response');
		}
		else
		{
			console.log('Error ' + xhr.status);
		}
	};
	xhr.send(JSON.stringify(json));
}