if('WebSocket' in window) {
	var ws = new WebSocket('ws://localhost:8888/socket'),
		form = document.getElementById('comp');

	ws.onopen = function(evt) {
		console.log('websocket.onopen', evt);
	};
	ws.onmessage = function(evt) { 
		console.log('websocket.onmessage', evt);

		result = JSON.parse(evt.data);
		if(result['result']) {
			// Replace the current viewer’s image with rendering result
			displayImage(result['result'], display)
			removeClass(canvas, 'rendering');
		}

		log('<p>' +result['message'] +'</p>');
	};
	ws.onclose = function(evt) { 
		console.log('websocket.onclose', evt);
	};

	window.onbeforeunload = function() {
		ws.onclose = function () {};
		ws.close()
	};

	form.addEventListener('submit', function(e) {
		console.log('form.submit', referenceFile);

		if(referenceFile) {
			addClass(canvas, 'rendering');
			ws.send(JSON.stringify({
				'reference_file': referenceFile,
				'filters': filterConfig
			}));

			log('<p>Render file ' +referenceFile +'</p>');
		}else {
			log('<p class="error">No file uploaded</p>');
		}

		e.preventDefault();
	});
}else {
	// This browser doesn’t support WebSocket
	var errorMsg = 'WebSocket is not supported by your Browser.';
	console.log(errorMsg);
	log('<p class="error">' +errorMsg +'</p>');
};
