#!/usr/bin/env python3
"""
Simple server for portfolio website with EmailJS configuration
"""
import os
import sys
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json

class PortfolioHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/' or self.path == '/index.html':
            # Generate the configured HTML and serve it
            self.generate_and_serve_html()
        else:
            # Serve other static files normally
            super().do_GET()
    
    def generate_and_serve_html(self):
        """Generate HTML with EmailJS configuration and serve it"""
        # Get EmailJS configuration from environment
        config = {
            'service_id': os.environ.get('EMAILJS_SERVICE_ID', ''),
            'template_id': os.environ.get('EMAILJS_TEMPLATE_ID', ''),
            'public_key': os.environ.get('EMAILJS_PUBLIC_KEY', '')
        }
        
        try:
            # Read the original HTML file
            with open('index.html', 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Create meta tags for EmailJS configuration
            meta_tags = f'''
  <!-- EmailJS Configuration -->
  <meta name="emailjs-service-id" content="{config['service_id']}">
  <meta name="emailjs-template-id" content="{config['template_id']}">
  <meta name="emailjs-public-key" content="{config['public_key']}">'''
            
            # Insert the meta tags before </head>
            html_content = html_content.replace('</head>', meta_tags + '\n</head>')
            
            # Send the response
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', len(html_content.encode('utf-8')))
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f'Internal Server Error: {str(e)}')

def run_server(port=5000):
    """Run the server"""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, PortfolioHandler)
    
    print(f"Server running on http://0.0.0.0:{port}/")
    print("EmailJS configured and ready to receive contact form submissions")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()