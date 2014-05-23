if('WebSocket' in window) {
	console.log("Launch Websocket!");

	var ws = new WebSocket('ws://localhost:8888/socket');

	ws.onopen = function(evt) {
		console.log('connection opened: ', evt);
	};
	ws.onmessage = function(evt) { 
		console.log('msg received: ', evt);
		result = JSON.parse(evt.data);
		document.getElementById('canvas').innerHTML += '<p>' +result['message'] +'</p>';
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
		document.getElementById('canvas').innerHTML += '<p>Render file ' +window.referenceFile +'</p>';
		ws.send(JSON.stringify({
			'reference_file': window.referenceFile,
			'generic_value': input.value
		}));
	}else {
		document.getElementById('canvas').innerHTML += '<p class="error">No file uploaded</p>';
	}
});

window.onbeforeunload = function() {
	ws.onclose = function () {};
	ws.close()
};