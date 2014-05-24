if(maxFilesize == undefined) {
	maxFilesize = 5;
}

var dz = new Dropzone("#canvas", {
	init: function() {
		// Remove fallback file field
		document.getElementById('fileUpload').remove();

		this.on('success', function(file, response) {
			console.debug('dropzone.success', file, response);

			// Save server response in global variable for usage in render app
			var resp = JSON.parse(response);
			referenceFile = resp['filename'];
			log(
				'<p>Uploaded File ' +window.referenceFile +
				' to ' +resp['path'] +'</p>'
			);
		});
		this.on('addedfile', function(file) {
			console.log('dropzone.addedfile', file);
		});
		this.on('sending', function(file) {
			loadImage(file, function(image) {
				displayImage(image, display);
			});
		});
	},
	url: "/upload",
	method: 'put',
	paramName: 'file',
	acceptedFiles: 'image/*',
	maxFilesize: maxFilesize,
	previewsContainer: document.getElementById('log'),
	createImageThumbnails: false
});
