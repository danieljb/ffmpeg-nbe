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
			'filters': {
				"edges": {
					"video 0": {
						"label": "video 0",
						"type": "VIDEO"
					},
					"video 1": {
						"label": "video 1",
						"type": "VIDEO"
					}
				},
				"vertices": {
					"input": {
						"label": "input",
						"ports": [
							{
								"edgeId": "video 0",
								"id": "0",
								"label": "X",
								"type": "VIDEO"
							}
						]
					},
					"output": {
						"label": "output",
						"ports": [
							{
								"direction": "in",
								"edgeId": "video 1",
								"id": "0",
								"label": "X",
								"type": "VIDEO"
							}
						]
					},
					"v0": {
						"description": "Blur the input.",
						"details": {
							"params": [
								{
									"default": "2",
									"id": "luma_radius",
									"value": "5"
								},
								{
									"default": "2",
									"id": "luma_power",
									"value": "5"
								},
								{
									"id": "chroma_radius",
									"value": "3"
								},
								{
									"id": "chroma_power",
									"value": "3"
								},
								{
									"id": "alpha_radius",
									"value": ""
								},
								{
									"id": "alpha_power"
								}
							]
						},
						"label": "boxblur",
						"ports": [
							{
								"direction": "in",
								"edgeId": "video 0",
								"id": "0",
								"label": "X",
								"type": "VIDEO"
							},
							{
								"direction": "out",
								"edgeId": "video 1",
								"id": "1",
								"label": "Y",
								"type": "VIDEO"
							}
						]
					}
				}
			}
		}));
	}else {
		document.getElementById('log').innerHTML += '<p class="error">No file uploaded</p>';
	}
});

window.onbeforeunload = function() {
	ws.onclose = function () {};
	ws.close()
};