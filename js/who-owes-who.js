// TODO: Add an accumulator/calculator for the input strings to do basic
// arithmetic.

(function() {
	var d = document;
	var submits = d.querySelectorAll(".submit");
	var output = document.getElementById('output');

	var forEach = function (array, callback, scope) {
		for (var i = 0, k = array.length; i < k; i++) {
			callback.call(scope, i, array[i]);
		}
	};

	var reset = d.getElementById("reset");
	if (reset) {
		reset.addEventListener('click', function(ev) {
			ev.preventDefault();
			forEach(d.querySelectorAll("input"), function(idx, item) {
				if (item.type === 'text') item.value = 0;
				output.innerHTML = '';
			});
		});
	}

	var inputs = [].slice.call(document.querySelectorAll("input"))
		.filter(function(x) { return x.type === 'text'; });
	console.log(inputs);

	forEach(inputs, function(idx, item) {

		item.addEventListener('focus', function(ev) {
			if (Number(item.value) === 0) item.value = '';
		});

		item.addEventListener('blur', function(ev) {
			if (item.value.trim() === '') item.value = 0;
		});

		item.addEventListener('keydown', function(ev) {
			// Allow numbers:
			if (ev.keyCode > 47 && ev.keyCode < 58) {
				return true;
			}

			console.log(ev.code + ": " + ev.keyCode);

			switch (ev.keyCode) {
				case 9: // Tab
					inputs[(idx+1)%inputs.length].focus();
					return false;
				case 82: // KeyR = reload
					return false;
				case 187: // Equals
					item.value = item.value.trim() === '' ? 0 : item.value;
					item.value = (Number.parseInt(item.value) + 1);
					return false;
				case 189: // -
					item.value = item.value.trim() === '' ? 0 : item.value;
					item.value = (Number.parseInt(item.value) - 1);
					return false;
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
					return false;
				case 8: // Backspace
					return true;
				case 190: // .
					return true;
				case 16: // ShiftLeft, ShiftRight
					return true;
				default:
					break;
			}

			ev.preventDefault();

		});
	});

	forEach(submits, function (i, el) {
		el.addEventListener('click', function(ev) {
			ev.preventDefault();
			the_thing();
			return false;
		});
	});

	function the_thing() {

		var reverse = function(x, y) { return x.value < y.value; };
		var inorder = function(x, y) { return x.value > y.value; };
		var values = [];

		forEach(d.querySelectorAll("input"), function(idx, item) {
			if (item.type === 'text') {
				values.push({
					name: item.name,
					value: isNaN(Number(item.value)) ? 0 : Number(item.value),
				});
			}
		});

		values.sort(reverse);

		var sum = values
			.map(function(obj) { return obj.value })
			.reduce(function(x, y) { return x+y; });

		var avg = sum / values.length;

		var owed = values.map(function(x) {
			return {
				name: x.name,
				value: avg - x.value,
			};
		});

		var payments = (function(total, owed) {
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
		})(sum, owed);

		var out = "";
		out += "<h1>Payments:</h1>";
		out += "<table>";
		out += payments.map(function(x) {
			var ret = "<tr>"
				+ "<td>" + x.from + "</td>"
				+ "<td>&rarr;</td>"
				+ "<td>" + x.to + ":</td>"
				+ "<td class='payment'><b>"
				+ "$" + x.value + "</b></td>"
				+ "</tr>";
			return ret;
		}).join(' ');
		out += "</table>";

		output.innerHTML = out;

	}
})();
