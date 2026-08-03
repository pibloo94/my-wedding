"""Derive clean, transparent brand assets from the AI-generated watercolor sources.

Strategy: only the background that is *connected to the image border* is made
transparent. Interior white areas (azahar / hydrangea petals, white paws, the
cream shield) are preserved because they are not connected to the border.
Edges are then feathered slightly to remove the white halo left by the
anti-aliased watercolor outline.
"""

import os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

SRC_DIR = r"C:\Users\Pablo\.cursor\projects\c-Users-Pablo-Desktop-my-wedding\assets"
OUT_DIR = r"C:\Users\Pablo\Desktop\my-wedding\public\assets\brand"

# The original hand-composed crest (with the three cats) provided at the start.
SOURCE_CREST = (
    "c__Users_Pablo_AppData_Roaming_Cursor_User_workspaceStorage_"
    "4c116c27e98c4b1e77eb27111e5b17bc_images_ChatGPT_Image_3_ago_2026__"
    "16_06_04-48d8dc19-00d8-49cb-8962-79a8f2b37df5.png"
)

# name -> dict(src, longest side px, remove_interior, threshold)
#   remove_interior=True  -> also clear near-white pockets NOT connected to the
#                            border (e.g. the enclosed hole inside a curled tail).
#                            Only safe for subjects that contain no legitimate
#                            white (the ginger and black cats).
JOBS = {
    "crest":            dict(src="crest.png",            longest=1100),
    # The full crest keeps its cream shield & warm azahar, so we only strip the
    # *pure neutral* background white — even where it is enclosed between the
    # foliage, ribbons and cats. Warm (cream) whites are kept via the chroma gate.
    "crest-cats":       dict(src=SOURCE_CREST,           longest=1100,
                             remove_interior=True, threshold=246, neutral_chroma=8),
    "cat-orange":       dict(src="cat-orange.png",       longest=820, remove_interior=True, threshold=250),
    "cat-black":        dict(src="cat-black.png",        longest=820, remove_interior=True, threshold=250),
    "cat-grey":         dict(src="cat-grey.png",         longest=900),
    "botanical-corner": dict(src="botanical-corner.png", longest=900),
    "divider-sprig":    dict(src="divider-sprig.png",    longest=1300),
}

# A pixel counts as "background candidate" when it is near-white.
WHITE_THRESHOLD = 240


def remove_border_background(img: Image.Image, remove_interior: bool = False,
                            threshold: int = WHITE_THRESHOLD,
                            neutral_chroma: int | None = None) -> Image.Image:
    rgba = img.convert("RGBA")
    arr = np.asarray(rgba).astype(np.int16)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    # near-white mask
    near_white = (r >= threshold) & (g >= threshold) & (b >= threshold)

    if neutral_chroma is not None:
        # Restrict to *neutral* whites (background paper), sparing warm cream
        # tones (shield, azahar, hydrangea, ribbon) which carry a colour cast.
        chroma = np.max(arr[..., :3], axis=-1) - np.min(arr[..., :3], axis=-1)
        near_white = near_white & (chroma <= neutral_chroma)

    if remove_interior:
        # Clear every masked pixel, including pockets fully enclosed by the
        # subject. Combined with the chroma gate this is safe for the crest.
        bg_mask = near_white
    else:
        # label connected near-white regions (8-connectivity)
        structure = np.ones((3, 3), dtype=np.int8)
        labels, n = ndimage.label(near_white, structure=structure)

        # any label that appears on the border is background
        border_labels = set(labels[0, :]) | set(labels[-1, :]) | set(labels[:, 0]) | set(labels[:, -1])
        border_labels.discard(0)

        bg_mask = np.isin(labels, list(border_labels))

    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

    out = arr[..., :3].astype(np.uint8)
    result = np.dstack([out, alpha])
    im = Image.fromarray(result, "RGBA")

    # Feather the alpha a touch to soften the cut edge, then erode by ~1px so the
    # residual white halo from the watercolor outline is trimmed away.
    a = im.getchannel("A")
    a = a.filter(ImageFilter.MaxFilter(3))          # close tiny holes
    a = a.filter(ImageFilter.MinFilter(3))          # erode halo by ~1px
    a = a.filter(ImageFilter.GaussianBlur(0.6))     # soft edge
    im.putalpha(a)
    return im


def autocrop(im: Image.Image, pad_ratio: float = 0.015) -> Image.Image:
    alpha = np.asarray(im.getchannel("A"))
    ys, xs = np.where(alpha > 8)
    if len(xs) == 0:
        return im
    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()
    pad = int(max(im.width, im.height) * pad_ratio)
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(im.width - 1, x1 + pad); y1 = min(im.height - 1, y1 + pad)
    return im.crop((x0, y0, x1 + 1, y1 + 1))


def resize_max(im: Image.Image, longest: int) -> Image.Image:
    scale = longest / max(im.width, im.height)
    if scale >= 1:
        return im
    return im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, cfg in JOBS.items():
        path = os.path.join(SRC_DIR, cfg["src"])
        if not os.path.exists(path):
            print(f"[skip] missing {path}")
            continue
        im = Image.open(path)
        im = remove_border_background(
            im,
            remove_interior=cfg.get("remove_interior", False),
            threshold=cfg.get("threshold", WHITE_THRESHOLD),
            neutral_chroma=cfg.get("neutral_chroma", None),
        )
        im = autocrop(im)
        im = resize_max(im, cfg["longest"])

        png_path = os.path.join(OUT_DIR, f"{name}.png")
        im.save(png_path, "PNG", optimize=True)

        webp_path = os.path.join(OUT_DIR, f"{name}.webp")
        im.save(webp_path, "WEBP", quality=90, method=6)

        print(f"[ok] {name}: {im.width}x{im.height}  "
              f"png={os.path.getsize(png_path)//1024}KB  "
              f"webp={os.path.getsize(webp_path)//1024}KB")


if __name__ == "__main__":
    main()
