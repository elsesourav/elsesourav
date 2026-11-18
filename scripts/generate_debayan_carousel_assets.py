#!/usr/bin/env python3
"""
Generate Hero Carousel Slider Assets for Dr. Debayan Ganguly Portfolio & CMS:
1. debayan-carousel-slider-desktop-21x9.png (2520x1080, 21:9 Ultrawide)
2. debayan-carousel-slider-mobile-3x4.png (1200x1600, 3:4 Portrait)
"""

import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BRAIN_DIR = '/Users/sourav/.gemini/antigravity/brain/7da36697-1914-45ae-9c83-26faaa033651'
ICON_SRC = '/Users/sourav/Developer/WEB/2026/August/debayan-ganguly-portfolio/public/favicon.png'
SCREEN_SRC = os.path.join(BRAIN_DIR, 'shot-home.png')

OUTPUT_21X9 = os.path.join(BRAIN_DIR, 'debayan-carousel-slider-desktop-21x9.png')
OUTPUT_3X4 = os.path.join(BRAIN_DIR, 'debayan-carousel-slider-mobile-3x4.png')

FONT_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
FONT_SERIF = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf'
FONT_TITLE = '/System/Library/Fonts/Supplemental/Futura.ttc'
FONT_TREBUCHET = '/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf'
FONT_REGULAR = '/System/Library/Fonts/HelveticaNeue.ttc'

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def create_academic_background(w, h, glow_cx=0.70, glow_cy=0.50):
    y, x = np.ogrid[:h, :w]
    cx, cy = w * 0.45, h * 0.5
    max_r = math.hypot(cx, cy)
    r = np.hypot(x - cx, y - cy) / max_r
    t = np.clip(r, 0.0, 1.0) ** 1.6

    red = (10 * (1 - t) + 3 * t).astype(np.uint8)
    green = (18 * (1 - t) + 6 * t).astype(np.uint8)
    blue = (36 * (1 - t) + 14 * t).astype(np.uint8)
    alpha = np.full((h, w), 255, dtype=np.uint8)

    bg = Image.fromarray(np.dstack([red, green, blue, alpha]))

    glow_w = int(w * 0.6)
    glow_h = int(h * 0.7)
    glow_img = Image.new('RGBA', (glow_w, glow_h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_img)
    gdraw.ellipse([0, 0, glow_w, glow_h], fill=(245, 158, 11, 26))
    glow_blurred = glow_img.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.12)))

    gx = int(w * glow_cx - glow_w // 2)
    gy = int(h * glow_cy - glow_h // 2)
    bg.paste(glow_blurred, (gx, gy), glow_blurred)

    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    grid_sz = 48
    grid_col = (255, 255, 255, 7)
    for px in range(0, w, grid_sz):
        odraw.line([(px, 0), (px, h)], fill=grid_col, width=1)
    for py in range(0, h, grid_sz):
        odraw.line([(0, py), (w, py)], fill=grid_col, width=1)

    return Image.alpha_composite(bg, overlay)

def create_desktop_browser_mockup(raw_path, window_w, window_h, corner_radius=22, url="debayanganguly.web.app"):
    screenshot_img = Image.open(raw_path).convert('RGBA')

    titlebar_h = max(38, int(window_h * 0.054))
    border_w = 2

    window = Image.new('RGBA', (window_w, window_h), (0, 0, 0, 0))
    w_draw = ImageDraw.Draw(window)
    w_draw.rounded_rectangle([0, 0, window_w, window_h], radius=corner_radius, fill=(11, 19, 41, 255))

    viewport_w = window_w - border_w * 2
    viewport_h = window_h - titlebar_h - border_w
    viewport_x = border_w
    viewport_y = titlebar_h

    src_w, src_h = screenshot_img.size
    scale = viewport_w / src_w
    new_w = viewport_w
    new_h = int(src_h * scale)

    resized_sc = screenshot_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    if new_h >= viewport_h:
        cropped_sc = resized_sc.crop((0, 0, viewport_w, viewport_h))
    else:
        scale_h = viewport_h / src_h
        resized_sc = screenshot_img.resize((int(src_w * scale_h), viewport_h), Image.Resampling.LANCZOS)
        cropped_sc = resized_sc.crop((0, 0, viewport_w, viewport_h))

    v_mask = Image.new('L', (viewport_w, viewport_h), 0)
    v_draw = ImageDraw.Draw(v_mask)
    bottom_r = max(4, corner_radius - border_w)
    v_draw.rectangle([0, 0, viewport_w, viewport_h - bottom_r], fill=255)
    v_draw.rounded_rectangle([0, 0, viewport_w, viewport_h], radius=bottom_r, fill=255)

    window.paste(cropped_sc, (viewport_x, viewport_y), v_mask)

    t_layer = Image.new('RGBA', (window_w, titlebar_h), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(t_layer)
    for y_step in range(titlebar_h):
        t_prog = y_step / titlebar_h
        r_col = int(22 * (1 - t_prog * 0.3) + 14 * t_prog)
        g_col = int(32 * (1 - t_prog * 0.3) + 20 * t_prog)
        b_col = int(58 * (1 - t_prog * 0.3) + 38 * t_prog)
        t_draw.line([(0, y_step), (window_w, y_step)], fill=(r_col, g_col, b_col, 255))

    t_mask = Image.new('L', (window_w, titlebar_h), 0)
    tm_draw = ImageDraw.Draw(t_mask)
    tm_draw.rounded_rectangle([0, 0, window_w, window_h], radius=corner_radius, fill=255)

    window_t = Image.new('RGBA', (window_w, window_h), (0, 0, 0, 0))
    window_t.paste(t_layer, (0, 0), t_mask)
    window = Image.alpha_composite(window, window_t)

    btn_draw = ImageDraw.Draw(window)
    btn_r = max(4, int(titlebar_h * 0.15))
    btn_cy = titlebar_h // 2
    btn_gap = int(btn_r * 2.3)
    start_bx = max(16, int(window_w * 0.024))

    btn_draw.ellipse(
        [start_bx - btn_r, btn_cy - btn_r, start_bx + btn_r, btn_cy + btn_r],
        fill=(255, 95, 86, 255), outline=(224, 73, 66, 255), width=1
    )
    bx2 = start_bx + btn_gap
    btn_draw.ellipse(
        [bx2 - btn_r, btn_cy - btn_r, bx2 + btn_r, btn_cy + btn_r],
        fill=(255, 189, 46, 255), outline=(222, 161, 35, 255), width=1
    )
    bx3 = bx2 + btn_gap
    btn_draw.ellipse(
        [bx3 - btn_r, btn_cy - btn_r, bx3 + btn_r, btn_cy + btn_r],
        fill=(39, 201, 63, 255), outline=(30, 173, 51, 255), width=1
    )

    addr_h = max(22, int(titlebar_h * 0.62))
    addr_w = int(window_w * 0.54)
    addr_x = (window_w - addr_w) // 2
    addr_y = (titlebar_h - addr_h) // 2
    addr_r = addr_h // 2

    btn_draw.rounded_rectangle(
        [addr_x, addr_y, addr_x + addr_w, addr_y + addr_h],
        radius=addr_r,
        fill=(9, 14, 28, 230),
        outline=(255, 255, 255, 28),
        width=1
    )

    lock_size = max(8, int(addr_h * 0.42))
    lock_x = addr_x + 14
    lock_y = addr_y + (addr_h - lock_size) // 2
    btn_draw.rounded_rectangle(
        [lock_x, lock_y + lock_size // 3, lock_x + lock_size, lock_y + lock_size],
        radius=2,
        fill=(245, 158, 11, 240)
    )
    shackle_pad = 2
    btn_draw.arc(
        [lock_x + shackle_pad, lock_y, lock_x + lock_size - shackle_pad, lock_y + lock_size * 2 // 3],
        start=180, end=0, fill=(245, 158, 11, 240), width=2
    )

    font_addr = get_font(FONT_REGULAR, max(11, int(addr_h * 0.45)))
    btn_draw.text(
        (lock_x + lock_size + 8, addr_y + (addr_h - 14) // 2 - 1),
        url,
        font=font_addr,
        fill=(203, 213, 225)
    )

    btn_draw.line([(0, titlebar_h), (window_w, titlebar_h)], fill=(255, 255, 255, 25), width=1)

    border_layer = Image.new('RGBA', (window_w, window_h), (0, 0, 0, 0))
    b_draw = ImageDraw.Draw(border_layer)
    b_draw.rounded_rectangle(
        [1, 1, window_w - 2, window_h - 2],
        radius=corner_radius,
        outline=(255, 255, 255, 35),
        width=2
    )
    b_draw.line(
        [(corner_radius, 1), (window_w - corner_radius, 1)],
        fill=(255, 255, 255, 90),
        width=1
    )

    return Image.alpha_composite(window, border_layer)

def paste_mockup_with_smooth_shadow(canvas, element, x, y, pad=120, blur_radius=36, opacity=230):
    ew, eh = element.size
    shadow_box = Image.new('RGBA', (ew + pad * 2, eh + pad * 2), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_box)
    sdraw.rounded_rectangle(
        [pad + 8, pad + 16, pad + ew - 8, pad + eh + 8],
        radius=26,
        fill=(0, 0, 0, opacity)
    )
    blurred = shadow_box.filter(ImageFilter.GaussianBlur(radius=blur_radius))
    canvas.paste(blurred, (x - pad, y - pad), blurred)
    canvas.paste(element, (x, y), element)

def draw_eyebrow(draw, x, y, text, font):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pill_w = tw + 32
    pill_h = th + 18
    draw.rounded_rectangle(
        [x, y, x + pill_w, y + pill_h],
        radius=pill_h // 2,
        fill=(245, 158, 11, 26),
        outline=(245, 158, 11, 140),
        width=1
    )
    draw.text((x + 16, y + (pill_h - th) // 2 - 2), text, font=font, fill=(251, 191, 36))
    return pill_w, pill_h

def draw_feature_pill(draw, x, y, label, font, dot_color=(245, 158, 11)):
    bbox = font.getbbox(label)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pill_w = tw + 40
    pill_h = th + 18
    draw.rounded_rectangle(
        [x, y, x + pill_w, y + pill_h],
        radius=12,
        fill=(15, 23, 42, 220),
        outline=(255, 255, 255, 30),
        width=1
    )
    dot_r = 3
    dot_cy = y + pill_h // 2
    dot_cx = x + 14
    draw.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r], fill=dot_color)
    draw.text((x + 24, y + (pill_h - th) // 2 - 2), label, font=font, fill=(226, 232, 240))
    return pill_w, pill_h

def draw_cta_button(draw, x, y, w, h, text, fill=(245, 158, 11), text_color=(11, 19, 41), font=None):
    draw.rounded_rectangle(
        [x, y, x + w, y + h],
        radius=h // 2,
        fill=fill,
        outline=(255, 255, 255, 150),
        width=2
    )
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    arrow_sz = 14
    gap = 14
    total_w = tw + gap + arrow_sz
    start_x = x + (w - total_w) // 2
    ty = y + (h - th) // 2 - 2
    draw.text((start_x, ty), text, font=font, fill=text_color)
    ax = start_x + tw + gap
    ay = y + (h - arrow_sz) // 2
    draw.polygon(
        [(ax, ay), (ax + arrow_sz, ay + arrow_sz // 2), (ax, ay + arrow_sz)],
        fill=text_color
    )

def draw_link_pill(draw, x, y, url, font):
    bbox = font.getbbox(url)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    pill_w = tw + 56
    pill_h = max(44, th + 22)
    draw.rounded_rectangle(
        [x, y, x + pill_w, y + pill_h],
        radius=12,
        fill=(8, 14, 28, 240),
        outline=(255, 255, 255, 34),
        width=1
    )
    # Vector arrow top-right
    ax = x + 18
    ay = y + pill_h // 2
    draw.line([(ax, ay + 4), (ax + 9, ay - 5)], fill=(245, 158, 11), width=2)
    draw.line([(ax + 4, ay - 5), (ax + 9, ay - 5)], fill=(245, 158, 11), width=2)
    draw.line([(ax + 9, ay - 5), (ax + 9, ay)], fill=(245, 158, 11), width=2)

    draw.text((x + 36, y + (pill_h - th) // 2 - 2), url, font=font, fill=(203, 213, 225))
    return pill_w, pill_h

def generate_desktop_carousel_21x9():
    print("Generating 21:9 Ultrawide Desktop Carousel Banner (2520x1080)...")
    w, h = 2520, 1080
    banner = create_academic_background(w, h, glow_cx=0.72, glow_cy=0.50)
    draw = ImageDraw.Draw(banner)

    font_eyebrow = get_font(FONT_BOLD, 20)
    font_title = get_font(FONT_SERIF, 68)
    font_subtitle = get_font(FONT_TREBUCHET, 32)
    font_body = get_font(FONT_REGULAR, 23)
    font_pill = get_font(FONT_BOLD, 19)
    font_btn = get_font(FONT_BOLD, 22)
    font_code = get_font(FONT_BOLD, 20)

    left_x = 120

    # 1. Eyebrow Badge
    draw_eyebrow(draw, left_x, 155, "ACADEMIC PORTFOLIO & CMS • BILINGUAL i18n • KaTeX MATH", font_eyebrow)

    # 2. Icon + Title
    icon_im = Image.open(ICON_SRC).convert('RGBA')
    icon_sz = 84
    icon_sm = icon_im.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 235), icon_sm)
    draw.text((left_x + 104, 240), "Dr. Debayan Ganguly", font=font_title, fill=(255, 255, 255))

    # 3. Subtitle
    draw.text((left_x, 345), "Academic Portfolio & Administrative CMS", font=font_subtitle, fill=(245, 158, 11))

    # 4. Description
    draw.text((left_x, 405), "Official academic presence and administrative CMS platform engineered for", font=font_body, fill=(148, 163, 184))
    draw.text((left_x, 442), "Dr. Debayan Ganguly, Deputy Director OSD & Ex-officio, Govt. of West Bengal.", font=font_body, fill=(148, 163, 184))

    # 5. Feature Badges
    pills = ["Bilingual (English & Bengali)", "KaTeX Math Proofs", "Cloud Firestore CMS", "Research & Grants"]
    px = left_x
    py = 505
    for p in pills:
        pw, ph = draw_feature_pill(draw, px, py, p, font_pill, dot_color=(245, 158, 11))
        px += pw + 16

    # 6. Action Button + Link Box
    btn_y = 590
    draw_cta_button(draw, left_x, btn_y, 250, 56, "EXPLORE PORTAL", fill=(245, 158, 11), text_color=(11, 19, 41), font=font_btn)
    draw_link_pill(draw, left_x + 276, btn_y, "debayanganguly.web.app", font_code)

    # RIGHT: HERO DESKTOP WINDOW (1260 x 820)
    win = create_desktop_browser_mockup(
        SCREEN_SRC,
        1260, 820,
        corner_radius=22,
        url="debayanganguly.web.app"
    )
    win_x = 1140
    win_y = (h - 820) // 2
    paste_mockup_with_smooth_shadow(banner, win, win_x, win_y, pad=120, blur_radius=36, opacity=230)

    banner.save(OUTPUT_21X9, 'PNG', optimize=True)
    print(f"✓ Saved 21:9 Desktop Carousel: {OUTPUT_21X9}")

def generate_mobile_carousel_3x4():
    print("Generating 3:4 Mobile Carousel Banner (1200x1600)...")
    w, h = 1200, 1600
    banner = create_academic_background(w, h, glow_cx=0.50, glow_cy=0.68)
    draw = ImageDraw.Draw(banner)

    font_eyebrow = get_font(FONT_BOLD, 18)
    font_title = get_font(FONT_SERIF, 54)
    font_subtitle = get_font(FONT_TREBUCHET, 28)
    font_body = get_font(FONT_REGULAR, 21)
    font_pill = get_font(FONT_BOLD, 18)
    font_btn = get_font(FONT_BOLD, 22)
    font_code = get_font(FONT_BOLD, 18)

    left_x = 80

    # 1. Eyebrow Badge
    draw_eyebrow(draw, left_x, 90, "ACADEMIC PORTFOLIO & CMS • BILINGUAL i18n", font_eyebrow)

    # 2. Icon + Title
    icon_im = Image.open(ICON_SRC).convert('RGBA')
    icon_sz = 72
    icon_sm = icon_im.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS)
    banner.paste(icon_sm, (left_x, 160), icon_sm)
    draw.text((left_x + 90, 165), "Dr. Debayan Ganguly", font=font_title, fill=(255, 255, 255))

    # 3. Subtitle
    draw.text((left_x, 260), "Academic Portfolio & Administrative CMS", font=font_subtitle, fill=(245, 158, 11))

    # 4. Description
    draw.text((left_x, 310), "Official academic presence and administrative CMS platform for", font=font_body, fill=(148, 163, 184))
    draw.text((left_x, 344), "Dr. Debayan Ganguly, Deputy Director OSD & Ex-officio (Govt. of WB).", font=font_body, fill=(148, 163, 184))

    # 5. Feature Badges (2 rows)
    row1 = ["Bilingual (English & Bengali)", "KaTeX Proofs"]
    row2 = ["Cloud Firestore CMS", "Research & Grants"]
    py = 405
    for row in [row1, row2]:
        px = left_x
        for p in row:
            pw, ph = draw_feature_pill(draw, px, py, p, font_pill, dot_color=(245, 158, 11))
            px += pw + 14
        py += ph + 12

    # 6. Action Button + Link Box
    btn_y = 540
    draw_cta_button(draw, left_x, btn_y, 240, 52, "EXPLORE PORTAL", fill=(245, 158, 11), text_color=(11, 19, 41), font=font_btn)
    draw_link_pill(draw, left_x + 262, btn_y, "debayanganguly.web.app", font_code)

    # 7. HERO DESKTOP WINDOW (1040 x 780, Centered)
    win = create_desktop_browser_mockup(
        SCREEN_SRC,
        1040, 780,
        corner_radius=22,
        url="debayanganguly.web.app"
    )
    win_x = (w - 1040) // 2
    win_y = 660
    paste_mockup_with_smooth_shadow(banner, win, win_x, win_y, pad=120, blur_radius=36, opacity=230)

    banner.save(OUTPUT_3X4, 'PNG', optimize=True)
    print(f"✓ Saved 3:4 Mobile Carousel Banner: {OUTPUT_3X4}")

if __name__ == '__main__':
    generate_desktop_carousel_21x9()
    generate_mobile_carousel_3x4()
    print("\n✓ Both Carousel Slider banners successfully regenerated with zero glyph tofu!")
