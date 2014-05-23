
import os
import json
import asyncio

from tornado import web, gen, template, websocket
from tornado.httpclient import AsyncHTTPClient
from tornado.platform.asyncio import AsyncIOMainLoop


MAX_FILE_SIZE = 10
PROJECT_ROOT = os.path.dirname(__file__)

UPLOADS = os.path.join(PROJECT_ROOT, 'uploads')
# O-oh. Convenience.
if not os.path.exists(UPLOADS):
    os.mkdir(UPLOADS)


class MainHandler(web.RequestHandler):
    def get(self):
        self.render('homepage.html')


class UploadHandler(web.RequestHandler):
    def get(self):
        self.render('upload.html', **{'filesize': MAX_FILE_SIZE})

    def put(self):
        print('file upload')

        content_length = int(self.request.headers.get('Content-Length', 0))
        if content_length <= MAX_FILE_SIZE *(1024 *1024):
            files = self.request.files.get('file', [])
            for file_config in files:
                filename = file_config.get('filename')
                path = os.path.join(UPLOADS, filename)
                with open(path, 'wb') as file:
                    file.write(file_config.get('body'))

            resp = {
                'path': os.path.relpath(path, PROJECT_ROOT),
                'filename': filename,
            }
            print(resp)
            self.finish(json.dumps(resp))
        else:
            print('File is too big')
            self.send_error(status_code=413)


class EchoWebSocket(websocket.WebSocketHandler):
    """
    Load node tree from client
    """
    def open(self):
        print('WebSocket opened')

    @gen.coroutine
    def on_message(self, msg):
        print(' < {0}'.format(msg))
        if msg is not None:
            render_config = json.loads(msg)

            # Do something asynchronous
            http_client = AsyncHTTPClient()
            response = yield http_client.fetch('http://example.com/')

            reply = 'Hello, apply generic value {0} to {1}'.format(
                render_config.get('generic_value'),
                render_config.get('reference_file'),
            )
            # Render reference_file with render_config values

            print(' > {0}'.format(reply))
            self.write_message(json.dumps({
                'reference_file': render_config.get('reference_file'),
                'result_url': '',
                'errors': [],
                'message': reply,
            }))

    def on_close(self):
        print('WebSocket closed')


settings = {
    'debug': True,
    'autoreload': False,
    'template_path': os.path.join(PROJECT_ROOT, 'templates'),
}


application = web.Application([
    (r'/', MainHandler),
    (r'/upload', UploadHandler),
    (r'/socket', EchoWebSocket),

    (r'/static/(.*)', web.StaticFileHandler, {
        'path': os.path.join(PROJECT_ROOT, 'assets'),
    }),
], **settings)


if __name__ == "__main__":
    AsyncIOMainLoop().install()
    application.listen(8888)
    asyncio.get_event_loop().run_forever()
