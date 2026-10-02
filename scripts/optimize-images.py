"""Generate responsive photo assets without changing the original photographs.

Run with Python 3 and Pillow when source images change. Generated files and the
manifest are checked in, so serving/building the demo needs no image toolchain.
"""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
images = root / "public" / "images"
output = images / "optimized"
output.mkdir(exist_ok=True)
stories = json.loads((root / "src" / "stories.json").read_text())
names = {story["image"] for story in stories} | {"R0000086", "20260603-R0000419"}
manifest = {}
generated = set()
original_bytes = optimized_bytes = 0

for name in sorted(names):
    source = images / f"{name}.jpg"
    original_bytes += source.stat().st_size
    with Image.open(source) as source_image:
        image = ImageOps.exif_transpose(source_image).convert("RGB")
        variants = []
        for width in (480, 960, 1920):
            if width > image.width:
                continue
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            buffer = BytesIO()
            resized.save(buffer, "WEBP", quality=82, method=6)
            data = buffer.getvalue()
            filename = f"{name}-{width}-{sha256(data).hexdigest()[:10]}.webp"
            (output / filename).write_bytes(data)
            generated.add(filename)
            variants.append({"width": width, "height": height, "file": filename})
            if width == 960:
                optimized_bytes += len(data)
        manifest[name] = {"width": image.width, "height": image.height, "variants": variants}

for stale in output.glob("*.webp"):
    if stale.name not in generated:
        stale.unlink()
(root / "src" / "image-assets.json").write_text(json.dumps(manifest, indent=2) + "\n")
print(f"{len(names)} photos: originals {original_bytes:,} bytes; 960px variants {optimized_bytes:,} bytes")
print(f"Reduction at 960px: {100 * (1 - optimized_bytes / original_bytes):.1f}%")
