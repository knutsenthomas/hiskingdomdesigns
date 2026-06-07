import os
from PIL import Image

logo_path = 'public/logo-hkm.png'
if not os.path.exists(logo_path):
    print(f"Error: {logo_path} not found!")
    exit(1)

# Open the logo
img = Image.open(logo_path)
print(f"Logo loaded: size={img.size}, mode={img.mode}")

# Ensure image has alpha channel (RGBA)
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Target outputs
targets = {
    'public/favicon-16x16.png': (16, 16),
    'public/favicon-32x32.png': (32, 32),
    'public/apple-touch-icon.png': (180, 180),
    'public/icon-192x192.png': (192, 192),
    'public/icon-512x512.png': (512, 512)
}

# Resize and save PNG files
for path, size in targets.items():
    resized = img.resize(size, Image.Resampling.LANCZOS)
    resized.save(path, 'PNG')
    print(f"Saved {path} with size {size}")

# Save ICO file containing multiple sizes
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_imgs = []
for size in ico_sizes:
    ico_imgs.append(img.resize(size, Image.Resampling.LANCZOS))

ico_path = 'public/favicon.ico'
ico_imgs[0].save(ico_path, format='ICO', sizes=ico_sizes, append_images=ico_imgs[1:])
print(f"Saved {ico_path} with sizes {ico_sizes}")
