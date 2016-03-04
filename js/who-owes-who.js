(function() {

	var self = this;

	var f = {
		adder      : function(x, y) { return x+y; },
		descending : function(x, y) { return x.value < y.value; },
		ascending  : function(x, y) { return x.value > y.value; },
		no_empty   : function(x) { return x.trim() !== ''; },
		to_float   : function(x) { return Number.parseFloat(x); },
		type_text  : function(x) { return x.type === 'text'; },
	};

	var el = {
		submits : document.querySelectorAll('.submit'),
		output  : document.getElementById('output'),
		form    : document.forms['the-form'],
		inputs  : [].slice.call(document.querySelectorAll('input')).filter(f.type_text),
	};

	self.calc = function(str) {
		if (str.trim() === '') return 0;
		var numbers = str.split(/[^0-9\.]/).filter(f.no_empty).map(f.to_float);
		var ops = str.split(/[0-9\.]+/).filter(f.no_empty);
		return Math.round(numbers.reduce(function(x, y) {
			return self.accumulator(x, y, ops.shift());
		})*100)/100;
	};

	self.accumulator = function(l, r, op) {
		switch(op) {
			case '+': return l + r;
			case '-': return l - r;
			default: return 0;
		}
		return 0;
	};

	self.removeLeadingZeroes = function(str) {
		while (str.length > 1 && Number(str[0]) === 0)
			str = str.slice(1);
		return str;
	};

	self.forEach = function (array, callback, scope) {
		for (var i = 0, k = array.length; i < k; i++) {
			callback.call(scope, i, array[i]);
		}
	};

	self.determinePayments = function(owed) {
		var payments = [];
		while(owed.length > 1) {
			var payee = owed[0];
			var payer = owed[owed.length-1];

			var payment = {
				from: payer.name,
				to: payee.name,
				value: Math.round(payer.value*100)/100.0,
			};

			if (payment.value < 0) {
				var temp = payment.to;
				payment.to = payment.from;
				payment.from = temp;
				payment.value = Math.abs(payment.value);
			}

			payments.push(payment);

			owed[0].value += payer.value;
			owed.pop();
		}
		return payments;
	};

	self.main = function() {

		var values = el.inputs.map(function(x) {
			return {
				name: x.name, 
				value: isNaN(Number.parseFloat(x.value)) ? 0 : Number.parseFloat(x.value),
			};
		}).sort(f.descending);

		var sum = values
			.map(function(obj) { return obj.value })
			.reduce(f.adder);

		var avg = sum / values.length;

		var payments = self.determinePayments(values.map(function(x) {
			return { name: x.name, value: avg - x.value, };
		}));

		var out = "";
		out += "<h1>Total</h1>";
		out += "<p>$" + sum + "</p>";
		out += "<h1>Payment Per Person:</h1>";
		out += "<p>$" + sum/values.length + "</p>";
		out += "<h1>Payments:</h1>";
		out += "<table>";
		out += payments.map(function(x) {
			return "<tr>"
				+ "<td>" + x.from + "</td>"
				+ "<td>&rarr;</td>"
				+ "<td>" + x.to + ":</td>"
				+ "<td class='payment'><b>"
				+ "$" + x.value + "</b></td>"
				+ "</tr>";
		}).join(' ');
		out += "</table>";
		el.output.innerHTML = out;

	};

	self.forEach(el.submits, function (i, el) {
		el.addEventListener('click', function(ev) {
			ev.preventDefault();
			self.main();
			return false;
		});
	});

	self.init = function() {
		self.forEach(el.inputs, function(idx, item) {

			item.addEventListener('focus', function(ev) {
				if (Number(item.value) === 0) item.value = '';
			});

			item.addEventListener('blur', function(ev) {
				if (item.value.trim() === '') item.value = 0;
				item.value = self.removeLeadingZeroes(item.value);
			});

			item.addEventListener('keydown', function(ev) {

				// Allow numbers:
				if (!ev.shiftKey && ev.keyCode > 47 && ev.keyCode < 58)
					return true;

				item.value = self.removeLeadingZeroes(item.value);

				// Return true if you want to allow character or action in form.
				switch (ev.keyCode) {
					case 9: // Tab
						if (ev.shiftKey)
							el.inputs[
								((idx === 0 ? el.inputs.length : 0) - 1) % el.inputs.length
							].focus();
						else
							el.inputs[(idx+1)%el.inputs.length].focus();
						break;
					case 82: // KeyR = reload
						return true;
					case 187: // Equals or +
						if (ev.shiftKey) { 
							if (item.value.length > 0 && !isNaN(Number(item.value[item.value.length-1]))) {
								return true;
							}
						} else {
							item.value = self.calc(item.value);
							item.focus();
						}
						break;
					case 189: // -
						if (!ev.shiftKey &&
								item.value.length > 0 &&
								!isNaN(Number(item.value[item.value.length-1]))) {
							return true;
						}
						break;
					case 37: // ArrowLeft
						return true;
					case 38: // ArrowUp
						item.value = item.value.trim() === '' ? 0 : item.value;
						item.value = (Number.parseInt(item.value) + 1);
						break;
					case 39: // ArrowRight
						return true;
					case 40: // ArrowDown
						item.value = item.value.trim() === '' ? 0 : item.value;
						item.value = (Number.parseInt(item.value) - 1);
						break;
					case 8: // Backspace
						return true;
					case 190: // .
						return true;
					case 16: // ShiftLeft, ShiftRight
						return true;
					case 13: // Enter
						self.forEach(el.inputs, function(i, el) {
							el.value = self.calc(el.value);
						});
						// TODO: Maybe I could add a history of submissions for form
						// reseting?
						el.submits[0].click();
						break;
					default:
						break;
				}
				// Else prevent any other characters from being entered
				ev.preventDefault();
			});
		});
	};

	self.init();

})();
