#!/usr/bin/env python3
"""
Simple script to inject EmailJS configuration into HTML file
This safely passes environment variables to the client without exposing them directly
"""
import os
import sys

def get_config():
    """Get EmailJS configuration from environment variables"""
    return {
        'service_id': os.environ.get('EMAILJS_SERVICE_ID', ''),
        'template_id': os.environ.get('EMAILJS_TEMPLATE_ID', ''),
        'public_key': os.environ.get('EMAILJS_PUBLIC_KEY', '')
    }

def inject_config_into_html():
    """Inject EmailJS config into HTML file"""
    config = get_config()
    
    # Read the HTML file
    try:
        with open('index.html', 'r') as f:
            html_content = f.read()
    except FileNotFoundError:
        print("index.html not found")
        return False
    
    # Create meta tags for EmailJS configuration
    meta_tags = f"""
  <!-- EmailJS Configuration -->
  <meta name="emailjs-service-id" content="{config['service_id']}">
  <meta name="emailjs-template-id" content="{config['template_id']}">
  <meta name="emailjs-public-key" content="{config['public_key']}">"""
    
    # Find the position to insert meta tags (after the existing meta tags)
    insert_position = html_content.find('</head>')
    if insert_position == -1:
        print("Could not find </head> tag")
        return False
    
    # Insert the meta tags
    new_html = html_content[:insert_position] + meta_tags + '\n' + html_content[insert_position:]
    
    # Write the updated HTML
    try:
        with open('index_with_config.html', 'w') as f:
            f.write(new_html)
        print("Configuration injected successfully into index_with_config.html")
        return True
    except Exception as e:
        print(f"Error writing file: {e}")
        return False

if __name__ == '__main__':
    if inject_config_into_html():
        sys.exit(0)
    else:
        sys.exit(1)