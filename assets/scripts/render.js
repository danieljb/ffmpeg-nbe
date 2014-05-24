if('WebSocket' in window) {
	console.log("Launch Websocket!");

	var ws = new WebSocket('ws://localhost:8888/socket');

	ws.onopen = function(evt) {
		console.log('connection opened: ', evt);
	};
	ws.onmessage = function(evt) { 
		console.log('msg received: ', evt);
		result = JSON.parse(evt.data);
		document.getElementById('log').innerHTML += '<p>' +result['message'] +'</p>';

		if(result['result']) {
			console.log('replace image with result', result['result']);
			var display = window.display;
			while(display.hasChildNodes()) {
				display.removeChild(display.lastChild);
			}

			img = document.createElement('img');
			img.src = result['result'];

			display.appendChild(img);
			window.canvas.setAttribute(
				'class', 
				(window.canvas.getAttribute('class') || '').replace('rendering', '').trim()
			);
		}
	};
	ws.onclose = function(evt) { 
		console.log('connection closed: ', evt);
	};
}else {
	// This browser doesn't support WebSocket
	console.log('WebSocket is not supported by your Browser.');
};

var form = document.getElementById('comp'),
	input = document.getElementById('genericValue');

input.focus();
form.addEventListener('submit', function(e) {
	e.preventDefault();

	console.log('Render with file', window.referenceFile);
	if(window.referenceFile) {
		document.getElementById('log').innerHTML += '<p>Render file ' +window.referenceFile +'</p>';
		window.canvas.setAttribute(
			'class', 
			(window.canvas.getAttribute('class') || '').split(' ').concat('rendering').join(' ')
		);
		ws.send(JSON.stringify({
			'reference_file': window.referenceFile,
			'generic_value': input.value
		}));
	}else {
		document.getElementById('log').innerHTML += '<p class="error">No file uploaded</p>';
	}
});

window.onbeforeunload = function() {
	ws.onclose = function () {};
	ws.close()
};