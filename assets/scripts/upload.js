if(window.maxFilesize == undefined) {
	window.maxFilesize = 5;
}
Dropzone.options.fileUpload = {
	init: function() {
		this.on('success', function(file, response) {
			console.log('success', file, response);
			var resp = JSON.parse(response);
			window.referenceFile = resp['filename'];
			document.getElementById('canvas').innerHTML += '<p>File: ' +window.referenceFile + ' (' +resp['path'] +')</p>';
		});
	},
	paramName: 'file',
	maxFilesize: window.maxFilesize,
	acceptedFiles: 'image/*',
	method: 'put'
};