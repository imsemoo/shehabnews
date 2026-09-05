#!/usr/bin/env python3
"""شهاب — static dev server with HTTP Range support.

`python -m http.server` ignores Range requests, so Chrome reports MP4/WebM
files as unseekable (video.seekable is empty): the progress bar cannot scrub
and Vidstack sees a zero duration. Production servers (nginx / Apache /
Laravel) serve ranges; this one does the same locally, adds the HLS / WebVTT
MIME types and disables caching so `?v=N` bumps are never needed while
developing.

Usage:  python serve.py [port]        (default: $PORT, else 5599)
"""
import http.server, mimetypes, os, re, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT') or 5599)   # arg > $PORT > 5599
mimetypes.add_type('application/vnd.apple.mpegurl', '.m3u8')
mimetypes.add_type('video/iso.segment', '.m4s')
mimetypes.add_type('video/mp2t', '.ts')
mimetypes.add_type('text/vtt', '.vtt')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('text/javascript', '.js')


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)$', self.headers.get('Range', '') or '')
        if not m:
            return super().send_head()
        size = os.path.getsize(path)
        start, end = m.group(1), m.group(2)
        if start == '' and end == '':
            return super().send_head()
        if start == '':                     # suffix range: last N bytes
            length = min(int(end), size)
            start, end = size - length, size - 1
        else:
            start = int(start)
            end = min(int(end), size - 1) if end else size - 1
        if start >= size or start > end:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        f = open(path, 'rb')
        f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_range_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        while left > 0:
            chunk = source.read(min(65536, left))
            if not chunk:
                break
            outputfile.write(chunk)
            left -= len(chunk)
        self._range_left = None

    def log_message(self, fmt, *args):
        if args and '/assets/video/' in str(args[0]):
            return                          # segments are noisy (args[0] may be an HTTPStatus on errors)
        super().log_message(fmt, *args)


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    print(f'Shehab dev server (HTTP ranges on) -> http://localhost:{PORT}/')
    http.server.ThreadingHTTPServer(('', PORT), RangeHandler).serve_forever()
