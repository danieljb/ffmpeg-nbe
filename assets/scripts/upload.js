if(maxFilesize == undefined) {
	maxFilesize = 5;
}
Dropzone.options.fileUpload = {
	init: function() {
		this.on('success', function(file, response) {
			console.log('success', file, response);
			document.getElementById('canvas').innerHTML += response +'<br/>';
		});
	},
	paramName: 'file',
	maxFilesize: maxFilesize,
	acceptedFiles: 'image/*',
	method: 'put'
};