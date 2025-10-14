#!/usr/bin/env python3
"""
Simple HTTP Server per WakeUpProof PWA
Avvia un server locale per testare l'applicazione
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class WakeUpProofHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Headers per PWA
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        # CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        super().end_headers()
    
    def do_GET(self):
        # Serve file con MIME types corretti
        if self.path == '/':
            self.path = '/index.html'
        
        # MIME types per PWA
        mime_types = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2'
        }
        
        # Estrai estensione file
        file_path = Path(self.path)
        if file_path.suffix in mime_types:
            self.send_response(200)
            self.send_header('Content-Type', mime_types[file_path.suffix])
            self.end_headers()
            
            try:
                with open(self.path[1:], 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404, "File not found")
        else:
            super().do_GET()
    
    def log_message(self, format, *args):
        # Log personalizzato
        print(f"[{self.date_time_string()}] {format % args}")

def main():
    PORT = 8000
    
    # Controlla se la porta è disponibile
    try:
        with socketserver.TCPServer(("", PORT), WakeUpProofHandler) as httpd:
            print("=" * 60)
            print("🚨 WakeUpProof PWA Server")
            print("=" * 60)
            print(f"Server avviato su: http://localhost:{PORT}")
            print(f"Directory: {os.getcwd()}")
            print("=" * 60)
            print("📱 Per testare l'app:")
            print("   1. Apri http://localhost:8000 nel browser")
            print("   2. Abilita permessi camera e notifiche")
            print("   3. Crea un allarme e testa i challenge")
            print("=" * 60)
            print("🛑 Premi Ctrl+C per fermare il server")
            print("=" * 60)
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server fermato")
                sys.exit(0)
                
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Errore: Porta {PORT} già in uso")
            print("   Prova con una porta diversa:")
            print(f"   python server.py --port 8001")
        else:
            print(f"❌ Errore: {e}")
        sys.exit(1)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='WakeUpProof PWA Server')
    parser.add_argument('--port', type=int, default=8000, help='Porta del server')
    parser.add_argument('--host', default='localhost', help='Host del server')
    
    args = parser.parse_args()
    
    PORT = args.port
    HOST = args.host
    
    try:
        with socketserver.TCPServer((HOST, PORT), WakeUpProofHandler) as httpd:
            print("=" * 60)
            print("🚨 WakeUpProof PWA Server")
            print("=" * 60)
            print(f"Server avviato su: http://{HOST}:{PORT}")
            print(f"Directory: {os.getcwd()}")
            print("=" * 60)
            print("📱 Per testare l'app:")
            print("   1. Apri http://localhost:8000 nel browser")
            print("   2. Abilita permessi camera e notifiche")
            print("   3. Crea un allarme e testa i challenge")
            print("=" * 60)
            print("🛑 Premi Ctrl+C per fermare il server")
            print("=" * 60)
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n🛑 Server fermato")
                sys.exit(0)
                
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Errore: Porta {PORT} già in uso")
            print("   Prova con una porta diversa:")
            print(f"   python server.py --port 8001")
        else:
            print(f"❌ Errore: {e}")
        sys.exit(1)
