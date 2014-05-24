
import os
import json
import base64
import mimetypes
import asyncio

from subprocess import Popen, PIPE

from tornado import web, gen, template, websocket
from tornado.httpclient import AsyncHTTPClient
from tornado.platform.asyncio import AsyncIOMainLoop

from parse_ff_graph import graph_to_filter_chain


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


def get_render_path(path):
    name, ext = os.path.splitext(path)
    return '{0}_render{1}'.format(name, ext)


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

            reply = 'Hello, apply generic value {0} to {1}'.format(
                render_config.get('generic_value'),
                render_config.get('reference_file'),
            )

            filters = graph_to_filter_chain(render_config.get('filters', {}))

            path = os.path.join(UPLOADS, render_config.get('reference_file'))

            result = None
            errors = []

            if os.path.exists(path):
                render_path = get_render_path(path)

                cmd = ['ffmpeg', '-i', path, '-vf', filters, '-y', render_path,]
                print('render with cmd', cmd)

                process = Popen(cmd, stdout=PIPE, stderr=PIPE)
                stdout, stderr = process.communicate()

                if process.returncode != 0:
                    errors.append(stderr)
                else:
                    data = base64.b64encode(
                        open(render_path, 'rb').read()
                    ).decode('ascii')
                    mtype, encoding = mimetypes.guess_type(path)
                    result = 'data:{0};base64,{1}'.format(mtype, data)
            else:
                errors.append('Could not load file from path {0}'.format(path))

            print(' > {0}'.format(reply))
            resp = {
                'reference_file': render_config.get('reference_file'),
                'result': result,
                'errors': errors,
                'message': reply,
            }
            self.write_message(json.dumps(resp))

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
