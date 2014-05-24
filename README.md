# ffmpeg nbe #

This is a proof of concept demonstration how [x1B’s](https://github.com/x1B) [node based editor <q>nbe</q>](https://github.com/x1B/nbe) could be used as an interface to apply filters to images using a server side ffmpeg installation.

## Code #

The server side is implemented in python (3.4, to make use of the asyncio module) and the [tornado](http://www.tornadoweb.org/) web framework.  
A python module for parsing nbe’s node tree is kindly provided by [dmurmann](https://github.com/dmurmann).  
The frontend uses [dropzone.js](http://www.dropzonejs.com/) for the convenient drag and drop file upload.

## Discalimer #

As this is a work in progress, proof of concept example application beware of potential security issues!
