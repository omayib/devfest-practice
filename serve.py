"""
Tiny local web server for the workshop, no installs needed.

    python3 serve.py        (Windows: py serve.py)

Then open http://localhost:8000. It turns off caching so your edits show up
on every refresh, and makes sure .js files are served as JavaScript.
"""
import http.server


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print("Open http://localhost:8000 (Ctrl+C to stop)")
    http.server.test(HandlerClass=Handler, port=8000, bind="127.0.0.1")
