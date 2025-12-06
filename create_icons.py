#!/usr/bin/env python3
"""
Icon Generator for Instagram School-Based Follower Bot
Creates three PNG icon files in different sizes.
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL (Pillow) not installed. Install with: pip install Pillow")

def create_icon_with_pil(size, filename):
    """Create icon using PIL/Pillow"""
    # Create gradient background
    img = Image.new('RGB', (size, size), color=(102, 126, 234))
    draw = ImageDraw.Draw(img)
    
    # Draw circle background
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], 
                 fill=(118, 75, 162))
    
    # Add "IG" text for larger icons
    if size >= 48:
        try:
            # Try to load a system font
            font_paths = [
                "/System/Library/Fonts/Helvetica.ttc",  # macOS
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
                "C:\\Windows\\Fonts\\arial.ttf",  # Windows
            ]
            
            font = None
            for font_path in font_paths:
                try:
                    font = ImageFont.truetype(font_path, size//3)
                    break
                except:
                    continue
            
            if font:
                text = "IG"
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                position = ((size - text_width) // 2, (size - text_height) // 2 - size//10)
                draw.text(position, text, fill=(255, 255, 255), font=font)
        except Exception as e:
            print(f"Could not add text: {e}")
    
    img.save(filename)
    print(f"✓ Created {filename} ({size}x{size})")

def create_icon_simple(size, filename):
    """Create simple colored square as fallback"""
    import struct
    
    def write_png(filename, width, height, rgb):
        """Write a simple PNG file"""
        import zlib
        
        def png_chunk(chunk_type, data):
            chunk_data = chunk_type + data
            crc = zlib.crc32(chunk_data) & 0xffffffff
            return struct.pack(">I", len(data)) + chunk_data + struct.pack(">I", crc)
        
        # PNG header
        png_header = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
        ihdr_chunk = png_chunk(b'IHDR', ihdr_data)
        
        # Create image data (RGB pixels)
        raw_data = b''
        for y in range(height):
            raw_data += b'\x00'  # Filter type
            for x in range(width):
                raw_data += struct.pack('BBB', rgb[0], rgb[1], rgb[2])
        
        # IDAT chunk (compressed image data)
        compressed = zlib.compress(raw_data, 9)
        idat_chunk = png_chunk(b'IDAT', compressed)
        
        # IEND chunk
        iend_chunk = png_chunk(b'IEND', b'')
        
        # Write PNG file
        with open(filename, 'wb') as f:
            f.write(png_header + ihdr_chunk + idat_chunk + iend_chunk)
        
        print(f"✓ Created {filename} ({size}x{size}) [simple]")
    
    # Create purple gradient color
    color = (102, 126, 234) if size == 16 else (118, 75, 162)
    write_png(filename, size, size, color)

def main():
    """Main function to create all icons"""
    print("Creating icons for Instagram Follower Bot...")
    print("-" * 50)
    
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]
    
    if PIL_AVAILABLE:
        print("Using PIL/Pillow for high-quality icons")
        for size, filename in sizes:
            create_icon_with_pil(size, filename)
    else:
        print("Using simple PNG generation (no PIL)")
        for size, filename in sizes:
            create_icon_simple(size, filename)
    
    print("-" * 50)
    print("✓ All icons created successfully!")
    print("\nNext steps:")
    print("1. Load the extension in Chrome (chrome://extensions/)")
    print("2. Enable 'Developer mode'")
    print("3. Click 'Load unpacked' and select this folder")

if __name__ == '__main__':
    main()







