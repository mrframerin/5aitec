"""Rewrite project entries in public/flight.js to swap Selected Work content."""
import re, sys, os

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'flight.js')
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# uid -> (title, subtitle, description)
mapping = {
    'ehealth-arena':       ('ShopOS',          'AI Agent OS · Active',                'Owning AI outcomes for brands — and building them agents and coworkers to get it done. Backed by Binny Bansal.'),
    'select-concept':      ('SeeIt',           'AI Smart Glasses · IRIS Labs',        'Open-source AI smart glasses. On-device memory. Built in public.'),
    'gamily':              ('Spuddish',        'Venture Fund · Active',               'Early-stage bets on the future of the web. Personal fund, hands-on, not a passive LP check.'),
    'alamance-foods':      ('Omvara',          'Luxury Fragrance · Active',           'Intentional fragrance. Built for stillness.'),
    'son':                 ('Scapic',          'No-code Metaverse · Exit to Walmart', "The world's first no-code Metaverse platform. 300,000+ experiences. Acquired by Walmart | Flipkart."),
    'glasbolaget':         ('Flipkart Camera', 'AR Commerce',                              "World's largest AR commerce surface. Tens of millions of Indians visualizing products before buying."),
    'spp-dream-generator': ('House of Models', 'AI Agent OS for Brand Commerce',           'AI agent OS purpose-built for brand commerce workflows.'),
    'ica-nissen':          ('Gibbon',          'Vision Pro · Spatial Presentations',  'Spatial presentations built for Vision Pro.'),
    'norrkopings-hamn':    ('Flipkart Labs',   'Moonshots · Drones, AI, EVs',         "Drones, AI, EVs — Flipkart's moonshot R&D arm."),
    'heip':                ('Cope Studio',     'Web3 Design + Capital',                    'Web3 design studio with venture capital baked in.'),
    'design-is-funny':     ('Dehidden',        'NFT Utility App Store',                    'An app store for NFT utility.'),
}

def js_escape(v):
    # Values live inside a JS string literal that contains a JSON string.
    # In flight.js: each JSON " is written as \" (single backslash + quote).
    # So in our raw file text, escape backslash -> \\ and " -> \".
    return v.replace('\\', '\\\\').replace('"', '\\"')

# Project entries: locate by uid, then replace title/subtitle/description within a window.
total = 0
for uid, (title, subtitle, description) in mapping.items():
    needle = '\\"uid\\":\\"' + uid + '\\"'
    idx = s.find(needle)
    if idx < 0:
        print(f'  NOT FOUND: {uid}')
        continue
    win_start = idx
    win_end = min(len(s), idx + 6000)
    window = s[win_start:win_end]
    orig = window

    # Field pattern: \"<field>\":\"<value-without-unescaped-quotes>\"
    # Captured values may contain \\\" (escaped quote within the value). We accept any non-\ char or \. sequences.
    # Use non-greedy: \"<field>\":\"((?:[^\\"]|\\.)*?)\"
    def replace_field(text, field, new_value):
        pat = re.compile(r'(\\"' + re.escape(field) + r'\\":\\")((?:[^\\"]|\\.)*?)(\\")', re.DOTALL)
        def repl(m):
            return m.group(1) + js_escape(new_value) + m.group(3)
        return pat.sub(repl, text, count=1)

    window = replace_field(window, 'title', title)
    window = replace_field(window, 'subtitle', subtitle)
    window = replace_field(window, 'description', description)

    if window == orig:
        print(f'  NO CHANGE: {uid}')
    else:
        s = s[:win_start] + window + s[win_end:]
        total += 1
        print(f'  updated: {uid} -> {title}')

# ItemList JSON-LD entries (separate block). Pattern: \"name\":\"<old>\"
itemlist = {
    'eHealth Arena':                'ShopOS',
    'Select Concept':               'SeeIt',
    'Gamily':                       'Spuddish',
    'Alamance Foods':               'Omvara',
    'Norrköpings Symfoniorkester': 'Scapic',
    'Glasbolaget':                  'Flipkart Camera',
    'SPP Dream Generator':          'House of Models',
    'ICA-nissen':                   'Gibbon',
    'Norrköpings Hamn':        'Flipkart Labs',
    'HEIP':                         'Cope Studio',
    'Design is Funny':              'Dehidden',
}
for old, new in itemlist.items():
    pat = '\\"name\\":\\"' + re.escape(old) + '\\"'
    repl = '\\"name\\":\\"' + js_escape(new) + '\\"'
    s, n = re.subn(pat, repl, s)
    print(f'  ItemList {old!r} -> {new}: {n} match')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(s)

print(f'done. project entries updated: {total}')
