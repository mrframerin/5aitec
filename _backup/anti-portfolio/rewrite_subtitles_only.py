"""Add subtitle changes to public/flight.js (titles already updated)."""
import os

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'flight.js')
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# (uid, old_subtitle, new_subtitle)
pairs = [
    ('ehealth-arena',       '3D Showroom',                 'AI Agent OS - Active'),
    ('select-concept',      '3D Interior Designer',        'AI Smart Glasses - IRIS Labs'),
    ('gamily',              'Campaign Website',            'Venture Fund - Active'),
    ('alamance-foods',      'Website',                     'Luxury Fragrance - Active'),
    ('son',                 'Website',                     'No-code Metaverse - Exit to Walmart'),
    ('glasbolaget',         '3D Configurator',             'AR Commerce'),
    ('spp-dream-generator', 'AI Image and Video Generator','AI Agent OS for Brand Commerce'),
    ('ica-nissen',          'AR Game',                     'Vision Pro - Spatial Presentations'),
    ('norrkopings-hamn',    '3D Flow Visualization',       'Moonshots - Drones, AI, EVs'),
    ('heip',                '3D Visualisation',            'Web3 Design + Capital'),
    ('design-is-funny',     'Portfolio',                   'NFT Utility App Store'),
]

def js_escape(v):
    return v.replace('\\', '\\\\').replace('"', '\\"')

total = 0
for uid, os_, ns in pairs:
    needle = '\\"uid\\":\\"' + uid + '\\"'
    idx = s.find(needle)
    if idx < 0:
        print(f'  MISS uid: {uid}')
        continue
    win_start = idx
    win_end = min(len(s), idx + 4000)
    window = s[win_start:win_end]
    old_pat = '\\"subtitle\\":\\"' + js_escape(os_) + '\\"'
    new_pat = '\\"subtitle\\":\\"' + js_escape(ns) + '\\"'
    if old_pat not in window:
        print(f'  MISS subtitle in window: {uid}')
        continue
    window = window.replace(old_pat, new_pat, 1)
    s = s[:win_start] + window + s[win_end:]
    total += 1
    print(f'  ok: {uid} ({os_}) -> {ns}')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print(f'subtitles updated: {total}/11')
