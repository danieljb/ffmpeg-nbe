if(window.maxFilesize == undefined) {
	window.maxFilesize = 5;
}
Dropzone.options.fileUpload = {
	init: function() {
		this.on('success', function(file, response) {
			console.log('success', file, response);
			var resp = JSON.parse(response);
			window.referenceFile = resp['filename'];
			document.getElementById('log').innerHTML += '<p>File: ' +window.referenceFile + ' (' +resp['path'] +')</p>';
		});
		this.on('addedfile', function(file) {
			console.log('added file', file);
			if(window.display) {
				var img = new Image();
				var reader = new FileReader();

				img.onload = function() {
					var display = window.display;
					while(display.hasChildNodes()) {
						display.removeChild(display.lastChild);
					}
					display.appendChild(img);
				}
				reader.onload = function(e) {
					console.log('File Reader loaded: ', e);
					img.src = e.target.result;
				}

				reader.readAsDataURL(file);
			}
		});
	},
	paramName: 'file',
	maxFilesize: window.maxFilesize,
	acceptedFiles: 'image/*',
	method: 'put'
};