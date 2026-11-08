import http.server, os, sys, functools
root=sys.argv[1]
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def send_head(self):
        p=self.translate_path(self.path)
        if not os.path.exists(p) and not self.path.endswith('/') and '.' not in os.path.basename(self.path.split('?')[0]):
            self.path=self.path.split('?')[0]+'/'
        return super().send_head()
http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(H,directory=root)).serve_forever()
