import os
import base64
from PIL import Image, ImageEnhance, ImageFilter

base_dir = r"c:\Users\anuna\Documents\antigravity\goofy-curie"
assets_dir = os.path.join(base_dir, "assets")
os.makedirs(assets_dir, exist_ok=True)

# 1. Clean the real scanned rubber stamp from ref_doc_5
ref5_path = os.path.join(assets_dir, "ref_docs", "ref_doc_5.png")
if os.path.exists(ref5_path):
    im = Image.open(ref5_path).convert("RGBA")
    # Stamp bounding box: center x=310, y=660, radius ~110
    crop = im.crop((195, 545, 425, 775))
    
    # Process transparency and isolate purple ink
    data = crop.getdata()
    cleaned_data = []
    for r, g, b, a in data:
        # Check if pixel is white/near-white
        if r > 195 and g > 195 and b > 195:
            cleaned_data.append((255, 255, 255, 0))
        # Black typed text overlay ("Mr. Pratik Pawar", "Assistant Team Leader")
        # In black text, r, g, b are all low and balanced (r<80, g<80, b<80)
        elif r < 90 and g < 90 and b < 90:
            # Replace heavy black text with stamp purple or make semi-transparent
            cleaned_data.append((45, 38, 120, 180))
        else:
            # Violet stamp ink: Blue is dominant over Green and Red
            cleaned_data.append((max(35, r - 20), max(30, g - 25), min(180, b + 30), min(255, int(255 * (1 - (r+g+b)/(3*250))))))
            
    crop.putdata(cleaned_data)
    real_stamp_path = os.path.join(assets_dir, "aparaitech_real_stamp_isolated.png")
    crop.save(real_stamp_path)
    print("Saved isolated real stamp:", real_stamp_path)

# 2. Generate Crisp SVG Official Seal
svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <defs>
    <!-- Top arc for APARAITECH -->
    <path id="arcTop" d="M 40,160 A 120,120 0 1,1 280,160" fill="none" />
    <!-- Bottom arc for BARAMATI -->
    <path id="arcBottom" d="M 280,160 A 120,120 0 1,1 40,160" fill="none" />
    
    <!-- Stamp texture filter -->
    <filter id="stampBleed" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <g filter="url(#stampBleed)" stroke="#262262" fill="#262262" opacity="0.92">
    <!-- Outer concentric circles -->
    <circle cx="160" cy="160" r="148" fill="none" stroke="#262262" stroke-width="5" />
    <circle cx="160" cy="160" r="139" fill="none" stroke="#262262" stroke-width="2" />
    <circle cx="160" cy="160" r="88" fill="none" stroke="#262262" stroke-width="3" />

    <!-- Top Text: APARAITECH -->
    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="26" font-weight="900" letter-spacing="7" fill="#262262">
      <textPath href="#arcTop" startOffset="50%" text-anchor="middle">APARAITECH</textPath>
    </text>

    <!-- Side Stars -->
    <text x="32" y="167" font-family="'Arial', sans-serif" font-size="24" text-anchor="middle" fill="#262262">★</text>
    <text x="288" y="167" font-family="'Arial', sans-serif" font-size="24" text-anchor="middle" fill="#262262">★</text>

    <!-- Bottom Text: BARAMATI -->
    <text font-family="'Arial Black', 'Impact', sans-serif" font-size="21" font-weight="900" letter-spacing="6" fill="#262262">
      <textPath href="#arcBottom" startOffset="50%" text-anchor="middle">BARAMATI</textPath>
    </text>

    <!-- Center Text: PUNE & PINCODE -->
    <text x="160" y="145" font-family="'Arial Black', sans-serif" font-size="23" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#262262">PUNE</text>
    <line x1="108" y1="154" x2="212" y2="154" stroke="#262262" stroke-width="2.5" />
    <text x="160" y="182" font-family="'Arial Black', sans-serif" font-size="25" font-weight="900" letter-spacing="4" text-anchor="middle" fill="#262262">413102</text>
  </g>
</svg>"""

svg_path = os.path.join(assets_dir, "aparaitech_official_stamp.svg")
with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)
print("Saved official SVG seal:", svg_path)
