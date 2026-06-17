from PIL import Image

def create_icon(size_px):
    # Brand orange color #d17d39 (RGB: 209, 125, 57)
    orange_color = (209, 125, 57, 255)
    
    # Create solid orange canvas (RGBA)
    canvas = Image.new("RGBA", (size_px, size_px), orange_color)
    
    # Load the logo
    logo = Image.open("public/logo-hkm.png")
    
    # Resize logo to fit the safe zone (about 70% of the canvas size)
    logo_size = int(size_px * 0.70)
    logo_resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Calculate position to center the logo
    offset = (size_px - logo_size) // 2
    
    # Paste logo using its alpha channel as the mask
    canvas.paste(logo_resized, (offset, offset), logo_resized)
    
    # Convert to RGB to guarantee a solid background (no transparency)
    return canvas.convert("RGB")

# Generate 512x512 icon
icon_512 = create_icon(512)
icon_512.save("public/icon-512x512.png", "PNG")
icon_512.save("public/apple-touch-icon.png", "PNG")
print("Saved 512x512 icon and apple-touch-icon.png")

# Generate 192x192 icon
icon_192 = create_icon(192)
icon_192.save("public/icon-192x192.png", "PNG")
print("Saved 192x192 icon")
