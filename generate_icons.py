#!/usr/bin/env python3
"""Generate DupeSweep extension icons and promotional images."""

from PIL import Image, ImageDraw, ImageFont
import math
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
EXTENSION_DIR = os.path.join(OUTPUT_DIR, "extension")
ASSETS_DIR = os.path.join(OUTPUT_DIR, "store_assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

# Colors
BLUE = (66, 133, 244)         # Google Blue #4285f4
DARK_BLUE = (25, 103, 210)    # #1967d2
LIGHT_BLUE = (138, 180, 248)  # #8ab4f8
RED = (217, 48, 37)           # #d93025
WHITE = (255, 255, 255)
DARK_GRAY = (60, 64, 67)      # #3c4043
LIGHT_GRAY = (241, 243, 244)  # #f1f3f4
TRANSPARENT = (0, 0, 0, 0)


def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    # Clamp radius
    radius = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    if fill:
        # Main body
        draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
        draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
        # Corners
        draw.pieslice([x0, y0, x0 + 2 * radius, y0 + 2 * radius], 180, 270, fill=fill)
        draw.pieslice([x1 - 2 * radius, y0, x1, y0 + 2 * radius], 270, 360, fill=fill)
        draw.pieslice([x0, y1 - 2 * radius, x0 + 2 * radius, y1], 90, 180, fill=fill)
        draw.pieslice([x1 - 2 * radius, y1 - 2 * radius, x1, y1], 0, 90, fill=fill)
    if outline:
        # Top and bottom edges
        draw.line([x0 + radius, y0, x1 - radius, y0], fill=outline, width=width)
        draw.line([x0 + radius, y1, x1 - radius, y1], fill=outline, width=width)
        # Left and right edges
        draw.line([x0, y0 + radius, x0, y1 - radius], fill=outline, width=width)
        draw.line([x1, y0 + radius, x1, y1 - radius], fill=outline, width=width)
        # Corner arcs
        draw.arc([x0, y0, x0 + 2 * radius, y0 + 2 * radius], 180, 270, fill=outline, width=width)
        draw.arc([x1 - 2 * radius, y0, x1, y0 + 2 * radius], 270, 360, fill=outline, width=width)
        draw.arc([x0, y1 - 2 * radius, x0 + 2 * radius, y1], 90, 180, fill=outline, width=width)
        draw.arc([x1 - 2 * radius, y1 - 2 * radius, x1, y1], 0, 90, fill=outline, width=width)


def draw_tab_icon(img, cx, cy, size, color, tab_color, is_duplicate=False):
    """Draw a browser tab shape."""
    draw = ImageDraw.Draw(img)
    w = size
    h = int(size * 0.75)
    tab_h = int(size * 0.18)
    tab_w = int(size * 0.4)
    radius = int(size * 0.08)

    # Tab body (rounded rect)
    x0, y0 = cx - w // 2, cy - h // 2 + tab_h
    x1, y1 = cx + w // 2, cy + h // 2 + tab_h
    draw_rounded_rect(draw, (x0, y0, x1, y1), radius, fill=color)

    # Tab header (small rounded rect on top)
    tx0 = cx - tab_w // 2
    ty0 = y0 - tab_h + 2
    tx1 = cx + tab_w // 2
    ty1 = y0 + 2
    draw_rounded_rect(draw, (tx0, ty0, tx1, ty1), radius // 2, fill=tab_color)

    # If duplicate, draw an X mark
    if is_duplicate:
        cross_size = int(size * 0.15)
        cross_cx = x1 - int(size * 0.15)
        cross_cy = y0 + int(size * 0.15)
        lw = max(2, int(size * 0.04))
        draw.line(
            [cross_cx - cross_size, cross_cy - cross_size,
             cross_cx + cross_size, cross_cy + cross_size],
            fill=RED, width=lw
        )
        draw.line(
            [cross_cx + cross_size, cross_cy - cross_size,
             cross_cx - cross_size, cross_cy + cross_size],
            fill=RED, width=lw
        )


def draw_sweep_arrow(draw, x0, y0, x1, y1, color, width=3):
    """Draw a curved sweep arrow."""
    # Draw a curved arrow using a series of lines
    points = []
    steps = 20
    # Quadratic bezier from (x0,y0) through control to (x1,y1)
    ctrl_x = (x0 + x1) / 2 + (y1 - y0) * 0.3
    ctrl_y = (y0 + y1) / 2 - (x1 - x0) * 0.15

    for i in range(steps + 1):
        t = i / steps
        px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ctrl_x + t ** 2 * x1
        py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * ctrl_y + t ** 2 * y1
        points.append((px, py))

    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=color, width=width)

    # Arrowhead
    angle = math.atan2(y1 - points[-2][1], x1 - points[-2][0])
    arrow_len = width * 3.5
    for offset_angle in [2.5, -2.5]:
        a = angle + offset_angle
        ax = x1 - arrow_len * math.cos(a)
        ay = y1 - arrow_len * math.sin(a)
        draw.line([(x1, y1), (ax, ay)], fill=color, width=width)


def generate_icon(size, padding=0):
    """Generate the DupeSweep icon at given size with optional padding."""
    total = size + padding * 2
    img = Image.new("RGBA", (total, total), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    cx, cy = total // 2, total // 2

    # Scale factors
    s = size / 96  # base scale

    # Draw background circle with subtle gradient effect
    bg_radius = int(44 * s)
    draw.ellipse(
        [cx - bg_radius, cy - bg_radius, cx + bg_radius, cy + bg_radius],
        fill=BLUE
    )
    # Inner lighter circle for depth
    inner_r = int(40 * s)
    # Slight offset for 3D feel
    for i in range(int(4 * s)):
        r = inner_r - i
        alpha = int(20 + i * 8)
        color = (*LIGHT_BLUE, alpha)
        draw.ellipse(
            [cx - r, cy - r - int(2 * s), cx + r, cy + r - int(2 * s)],
            fill=None, outline=color, width=1
        )

    # Back tab (slightly left and up) - the "original" tab
    tab_size = int(30 * s)
    back_x = cx - int(6 * s)
    back_y = cy - int(6 * s)
    draw_tab_icon(img, back_x, back_y, tab_size, WHITE, LIGHT_GRAY)

    # Front tab (slightly right and down) - the "duplicate" being swept
    front_x = cx + int(8 * s)
    front_y = cy + int(4 * s)
    # Semi-transparent tab to show it's being removed
    overlay = Image.new("RGBA", (total, total), TRANSPARENT)
    draw_tab_icon(overlay, front_x, front_y, tab_size, (*WHITE, 200), (*LIGHT_GRAY, 200), is_duplicate=True)
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Sweep motion lines (3 small curved lines suggesting movement)
    sweep_color = (*WHITE, 180)
    line_w = max(2, int(2.5 * s))
    for i, offset in enumerate([0, int(6 * s), int(12 * s)]):
        sx = front_x + int(16 * s) + offset
        sy = front_y - int(8 * s) + i * int(5 * s)
        length = int(8 * s)
        draw.line(
            [sx, sy, sx + length, sy - int(3 * s)],
            fill=sweep_color, width=line_w
        )

    return img


def generate_promo_small():
    """Generate 440x280 small promotional image."""
    w, h = 440, 280
    img = Image.new("RGBA", (w, h), WHITE)
    draw = ImageDraw.Draw(img)

    # Blue gradient background
    for y in range(h):
        t = y / h
        r = int(BLUE[0] * (1 - t * 0.3))
        g = int(BLUE[1] * (1 - t * 0.15))
        b = int(BLUE[2] * (1 - t * 0.05))
        draw.line([(0, y), (w, y)], fill=(r, g, b))

    # Place icon in center-left
    icon = generate_icon(96)
    icon_x = 40
    icon_y = (h - 128) // 2
    img.paste(icon, (icon_x, icon_y), icon)

    # Text on the right
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
        sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    except (OSError, IOError):
        title_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    text_x = 190
    draw.text((text_x, 85), "DupeSweep", fill=WHITE, font=title_font)
    draw.text((text_x, 130), "Sweep away duplicate tabs", fill=(*WHITE, 220), font=sub_font)
    draw.text((text_x, 155), "instantly. Keep your browser", fill=(*WHITE, 220), font=sub_font)
    draw.text((text_x, 180), "clean and organized.", fill=(*WHITE, 220), font=sub_font)

    return img.convert("RGB")


def generate_screenshot():
    """Generate a 1280x800 screenshot placeholder."""
    w, h = 1280, 800
    img = Image.new("RGB", (w, h), LIGHT_GRAY)
    draw = ImageDraw.Draw(img)

    # Chrome-like top bar
    bar_h = 80
    draw.rectangle([0, 0, w, bar_h], fill=WHITE)
    draw.line([(0, bar_h), (w, bar_h)], fill=(218, 220, 224), width=1)

    # Tab bar
    tab_h = 36
    draw.rectangle([0, 0, w, tab_h], fill=(241, 243, 244))

    # Fake tabs
    tab_w = 200
    for i in range(5):
        x = 10 + i * (tab_w + 4)
        color = WHITE if i == 0 else (228, 230, 232)
        draw_rounded_rect(draw, (x, 4, x + tab_w, tab_h), 8, fill=color)

    # Extension popup overlay
    popup_w, popup_h = 340, 300
    popup_x = w - popup_w - 20
    popup_y = bar_h + 10

    # Popup shadow
    draw_rounded_rect(
        draw,
        (popup_x + 3, popup_y + 3, popup_x + popup_w + 3, popup_y + popup_h + 3),
        8, fill=(0, 0, 0, 30)
    )
    # Popup body
    draw_rounded_rect(
        draw,
        (popup_x, popup_y, popup_x + popup_w, popup_y + popup_h),
        8, fill=WHITE, outline=(218, 220, 224), width=1
    )

    # Popup content
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        count_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
        btn_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 13)
    except (OSError, IOError):
        title_font = count_font = btn_font = ImageFont.load_default()

    # Header
    px, py = popup_x + 15, popup_y + 15
    draw.text((px, py), "12 tabs", fill=DARK_GRAY, font=count_font)
    draw.text((px + 55, py), "(3 duplicates)", fill=RED, font=count_font)

    # Sweep button
    btn_x = popup_x + popup_w - 105
    draw_rounded_rect(draw, (btn_x, py - 2, btn_x + 90, py + 22), 6, fill=BLUE)
    draw.text((btn_x + 10, py + 2), "Sweep dups", fill=WHITE, font=btn_font)

    # Duplicate list header
    draw.text((px, py + 40), "DUPLICATES", fill=(102, 102, 102), font=count_font)

    # Duplicate entries
    entries = [
        ("github.com/settings", "×2"),
        ("docs.google.com/doc...", "×2"),
        ("stackoverflow.com/q...", "×3"),
    ]
    for i, (url, count) in enumerate(entries):
        ey = py + 65 + i * 28
        draw.text((px + 5, ey), url, fill=(85, 85, 85), font=count_font)
        draw.text((popup_x + popup_w - 35, ey), count, fill=RED, font=count_font)

    # Domain list header
    draw.text((px, py + 160), "TOP DOMAINS", fill=(102, 102, 102), font=count_font)

    domains = [
        ("github.com", "5"),
        ("google.com", "3"),
        ("stackoverflow.com", "4"),
    ]
    for i, (domain, count) in enumerate(domains):
        ey = py + 185 + i * 28
        draw.text((px + 5, ey), domain, fill=(85, 85, 85), font=count_font)
        draw.text((popup_x + popup_w - 25, ey), count, fill=DARK_BLUE, font=count_font)

    return img


# Generate all assets
print("Generating extension icons...")

# 128x128 icon (96x96 with 16px padding)
icon_128 = generate_icon(96, padding=16)
icon_128.save(os.path.join(EXTENSION_DIR, "icon_128.png"))
print(f"  icon_128.png: {icon_128.size}")

# 48x48 icon
icon_48 = generate_icon(48)
icon_48.save(os.path.join(EXTENSION_DIR, "icon_48.png"))
print(f"  icon_48.png: {icon_48.size}")

# 16x16 icon
icon_16 = generate_icon(16)
icon_16.save(os.path.join(EXTENSION_DIR, "icon_16.png"))
print(f"  icon_16.png: {icon_16.size}")

# Grayscale version for inactive state
icon_128_gs = icon_128.convert("LA").convert("RGBA")
icon_128_gs.save(os.path.join(EXTENSION_DIR, "icon_128_gs.png"))
print(f"  icon_128_gs.png: {icon_128_gs.size}")

print("\nGenerating store assets...")

# Small promo image
promo = generate_promo_small()
promo.save(os.path.join(ASSETS_DIR, "promo_small_440x280.png"))
print(f"  promo_small_440x280.png: {promo.size}")

# Screenshot
screenshot = generate_screenshot()
screenshot.save(os.path.join(ASSETS_DIR, "screenshot_1280x800.png"))
print(f"  screenshot_1280x800.png: {screenshot.size}")

# Store icon (128x128, same as extension)
icon_128.save(os.path.join(ASSETS_DIR, "store_icon_128x128.png"))
print(f"  store_icon_128x128.png: copied")

print("\nAll assets generated!")
print(f"Extension icons: {EXTENSION_DIR}/")
print(f"Store assets: {ASSETS_DIR}/")
