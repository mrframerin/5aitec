"""Minimal: change only the project entry titles in public/flight.js."""
import os

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'flight.js')
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# (uid_anchor, old_title, new_title)
pairs = [
    ('ehealth-arena',       'eHealth Arena',                'ShopOS'),
    ('select-concept',      'Select Concept',               'SeeIt'),
    ('gamily',              'Gamily',                       'Spuddish'),
    ('alamance-foods',      'Alamance Foods',               'Omvara'),
    ('son',                 'Norrköpings Symfoniorkester', 'Scapic'),
    ('glasbolaget',         'Glasbolaget',                  'Flipkart Camera'),
    ('spp-dream-generator', 'SPP Dream Generator',          'House of Models'),
    ('ica-nissen',          'ICA-nissen',                   'Gibbon'),
    ('norrkopings-hamn',    'Norrköpings Hamn',        'Flipkart Labs'),
    ('heip',                'HEIP',                         'Cope Studio'),
    ('design-is-funny',     'Design is Funny',              'Dehidden'),
]

def js_escape(v):
    return v.replace('\\', '\\\\').replace('"', '\\"')

total = 0
for uid, ot, nt in pairs:
    # Anchor inside the right project entry by finding the uid, then replace
    # the FIRST title field inside that window only.
    needle = '\\"uid\\":\\"' + uid + '\\"'
    idx = s.find(needle)
    if idx < 0:
        print(f'  MISS uid: {uid}')
        continue
    win_start = idx
    win_end = min(len(s), idx + 4000)
    window = s[win_start:win_end]
    old_pat = '\\"title\\":\\"' + js_escape(ot) + '\\"'
    new_pat = '\\"title\\":\\"' + js_escape(nt) + '\\"'
    if old_pat not in window:
        print(f'  MISS title pattern in window: {uid}')
        continue
    window = window.replace(old_pat, new_pat, 1)
    s = s[:win_start] + window + s[win_end:]
    total += 1
    print(f'  ok: {uid} ({ot}) -> {nt}')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print(f'titles updated: {total}/11')
