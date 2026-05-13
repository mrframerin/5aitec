"""Rewrite all 10 remaining work pages: slug, title, headline, body, visit URL.
Then update flight.js uids and home.json whitelist.
"""
import os, re, copy, json, shutil

# ── helpers ──────────────────────────────────────────────────────────────────

def length_aware_replace(raw_bytes, old, new):
    delta = len(new) - len(old)
    pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
    chunks = []
    for m in pat.finditer(raw_bytes):
        declared = int(m.group(2), 16)
        chunks.append({
            'prefix_start': m.start(), 'prefix_end': m.end(),
            'declared': declared,
            'content_start': m.end(), 'content_end': m.end() + declared,
            'id': m.group(1).decode(), 'hex': m.group(2).decode(),
        })
    out = raw_bytes
    for c in sorted(chunks, key=lambda c: c['prefix_start'], reverse=True):
        content = out[c['content_start']:c['content_end']]
        occ = content.count(old)
        if occ == 0:
            continue
        new_content = content.replace(old, new)
        new_declared = c['declared'] + delta * occ
        new_hex = format(new_declared, 'x')
        new_prefix = f"{c['id']}:T{new_hex},".encode()
        out = out[:c['prefix_start']] + new_prefix + new_content + out[c['content_end']:]
    remaining = out.count(old)
    if remaining:
        out = out.replace(old, new)
    return out

def rewrite(raw, old_str, new_str, label=''):
    old_b = old_str.encode('utf-8')
    new_b = new_str.encode('utf-8')
    before = raw.count(old_b)
    raw = length_aware_replace(raw, old_b, new_b)
    after = raw.count(old_b)
    print(f'  {label or repr(old_str[:40])}: {before} -> {after} remaining')
    return raw

# ── page data ─────────────────────────────────────────────────────────────────

OLD_BODY = (
    "We created an interactive 3D platform that explores how the latest "
    "e-health solutions work in practice. From the patient's home to "
    "hospital environments and care providers' workplaces. Users can follow "
    "real care journeys, and understand how it all connects to create safer, "
    "more efficient care."
)
OLD_BODY_TRUNC = (
    "We created an interactive 3D platform that explores how the latest "
    "e-health solutions work in practice. From the patient&#x27;s home to..."
)

pages = [
    {
        'old_slug':    'select-concept',
        'new_slug':    'seeit',
        'old_title':   'eHealth Arena',
        'new_title':   'SeeIt',
        'old_headline':'3D Interior Designer',
        'new_headline':'AI Smart Glasses - IRIS Labs',
        'new_body': (
            "Open-source AI smart glasses. On-device memory. Built in public. "
            "Glass 1 is audio-first. Glass 2 targets a monochrome AR display. "
            "AutoDream consolidation engine for memory across sessions. "
            "On-device, privacy-first AI - no cloud dependency. "
            "IRIS patent covers smart glasses with persistent on-device memory "
            "and AutoDream consolidation. Explorer Edition co-branded with "
            "Lumio - 10,000-unit drop planned."
        ),
        'new_body_trunc': (
            "Open-source AI smart glasses. On-device memory. Built in public. "
            "Glass 1 is audio-first. Glass 2 targets a monochrome AR display..."
        ),
        'old_url':  'https://selectconcept.com/planner',
        'new_url':  'https://seeit.ai',
    },
    {
        'old_slug':    'gamily',
        'new_slug':    'spuddish',
        'old_title':   'eHealth Arena',
        'new_title':   'Spuddish',
        'old_headline':'Campaign Website',
        'new_headline':'Venture Fund - Active',
        'new_body': (
            "Early-stage bets on the future of the web. Sai's personal venture "
            "fund focused on startups building the decentralized, generative, "
            "and immersive web. Backs founders building things worth making - "
            "deep-tech, spatial computing, open-source protocols, generative AI. "
            "Hands-on, not a passive LP check. Portfolio includes Sentient, "
            "Gibbon, Cope Studio, Dehidden, Nume Zk - and counting."
        ),
        'new_body_trunc': (
            "Early-stage bets on the future of the web. Sai's personal venture "
            "fund focused on startups building the decentralized, generative..."
        ),
        'old_url':  'https://gamilyapp.com/',
        'new_url':  'https://spuddish.com',
    },
    {
        'old_slug':    'alamance-foods',
        'new_slug':    'omvara',
        'old_title':   'eHealth Arena',
        'new_title':   'Omvara',
        'old_headline':'Website',
        'new_headline':'Luxury Fragrance - Active',
        'new_body': (
            "Intentional fragrance. Built for stillness. A luxury perfume brand "
            "built with founder Shirali Chamola. Brand bible, 90-day execution "
            "tracker, and full identity system completed. Intentions is the debut "
            "line. Not another D2C fragrance play. Rooted in philosophy, ritual, "
            "and the quiet luxury of things that last - positioned at the "
            "intersection of slow brand building and deep-tech-informed marketing "
            "through ShopOS. The brand itself is a proof-of-concept for what "
            "ShopOS can do for a D2C founder starting from zero."
        ),
        'new_body_trunc': (
            "Intentional fragrance. Built for stillness. A luxury perfume brand "
            "built with founder Shirali Chamola. Brand bible, 90-day execution..."
        ),
        'old_url':  'https://www.alamancefoods.com/brands/coffee-toppers',
        'new_url':  'https://omvara.ngo',
    },
    {
        'old_slug':    'son',
        'new_slug':    'scapic',
        'old_title':   'eHealth Arena',
        'new_title':   'Scapic',
        'old_headline':'Website',
        'new_headline':'No-code Metaverse - Exit to Walmart',
        'new_body': (
            "The world's first no-code Metaverse platform. 300,000+ experiences. "
            "Acquired by Walmart and Flipkart."
        ),
        'new_body_trunc': (
            "The world's first no-code Metaverse platform. 300,000+ experiences. "
            "Acquired by Walmart and Flipkart."
        ),
        'old_url':  'https://www.norrkopingssymfoniorkester.se/',
        'new_url':  'https://scapic.com',
    },
    {
        'old_slug':    'glasbolaget',
        'new_slug':    'flipkart-camera',
        'old_title':   'eHealth Arena',
        'new_title':   'Flipkart Camera',
        'old_headline':'3D Configurator',
        'new_headline':'AR Commerce',
        'new_body': (
            "World's largest AR commerce surface. Tens of millions of Indians "
            "visualizing products before buying."
        ),
        'new_body_trunc': (
            "World's largest AR commerce surface. Tens of millions of Indians "
            "visualizing products before buying."
        ),
        'old_url':  'https://glasbolaget-configurator.vercel.app/',
        'new_url':  None,
    },
    {
        'old_slug':    'spp-dream-generator',
        'new_slug':    'house-of-models',
        'old_title':   'eHealth Arena',
        'new_title':   'House of Models',
        'old_headline':'AI Image and Video Generator',
        'new_headline':'AI Agent OS for Brand Commerce',
        'new_body':       'AI agent OS for brand commerce.',
        'new_body_trunc': 'AI agent OS for brand commerce.',
        'old_url':  'https://retirement-dream-generator.se',
        'new_url':  None,
    },
    {
        'old_slug':    'ica-nissen',
        'new_slug':    'gibbon',
        'old_title':   'eHealth Arena',
        'new_title':   'Gibbon',
        'old_headline':'AR Game',
        'new_headline':'Vision Pro - Spatial Presentations',
        'new_body':       'Vision Pro spatial presentations.',
        'new_body_trunc': 'Vision Pro spatial presentations.',
        'old_url':  None,
        'new_url':  None,
    },
    {
        'old_slug':    'norrkopings-hamn',
        'new_slug':    'flipkart-labs',
        'old_title':   'eHealth Arena',
        'new_title':   'Flipkart Labs',
        'old_headline':'3D Flow Visualization',
        'new_headline':'Moonshots - Drones, AI, EVs',
        'new_body':       'Moonshots - drones, AI, and EVs.',
        'new_body_trunc': 'Moonshots - drones, AI, and EVs.',
        'old_url':  'https://visual-of-sweden.vercel.app/hamnen',
        'new_url':  'https://flipkartlabs.com',
    },
    {
        'old_slug':    'heip',
        'new_slug':    'cope-studio',
        'old_title':   'eHealth Arena',
        'new_title':   'Cope Studio',
        'old_headline':'3D Visualisation',
        'new_headline':'Web3 Design + Capital',
        'new_body':       'Web3 design and capital.',
        'new_body_trunc': 'Web3 design and capital.',
        'old_url':  'https://heip-vis.vercel.app/sv',
        'new_url':  None,
    },
    {
        'old_slug':    'design-is-funny',
        'new_slug':    'dehidden',
        'old_title':   'eHealth Arena',
        'new_title':   'Dehidden',
        'old_headline':'Portfolio',
        'new_headline':'NFT Utility App Store',
        'new_body':       'NFT utility app store.',
        'new_body_trunc': 'NFT utility app store.',
        'old_url':  'https://www.designisfunny.co/',
        'new_url':  'https://dehidden.com',
    },
]

# ── process each page ─────────────────────────────────────────────────────────

for p in pages:
    old_slug = p['old_slug']
    new_slug = p['new_slug']
    src  = f'public/work/{old_slug}/index.html'
    dest_dir = f'public/work/{new_slug}'
    dest = f'{dest_dir}/index.html'

    print(f'\n{"="*60}')
    print(f'{old_slug} -> {new_slug}')

    # 1. Copy original to new slug dir
    os.makedirs(dest_dir, exist_ok=True)
    shutil.copy2(src, dest)

    raw = open(dest, 'rb').read()

    # 2. Slug replacement (T-prefix aware)
    raw = rewrite(raw, old_slug, new_slug, 'slug')

    # 3. Title
    raw = rewrite(raw, p['old_title'], p['new_title'], 'title')

    # 4. Subtitle/headline ("3D Showroom" is the inherited template subtitle)
    raw = rewrite(raw, '3D Showroom', p['new_headline'], 'subtitle(template)')
    if p['old_headline'] != '3D Showroom':
        raw = rewrite(raw, p['old_headline'], p['new_headline'], 'headline')

    # 5. Body (full + truncated meta variant)
    raw = rewrite(raw, OLD_BODY, p['new_body'], 'body(full)')
    trunc_new = p.get('new_body_trunc', p['new_body'][:80] + '...')
    raw = rewrite(raw, OLD_BODY_TRUNC, trunc_new, 'body(trunc)')

    # 6. Visit URL
    if p['old_url'] and p['new_url']:
        raw = rewrite(raw, p['old_url'], p['new_url'], 'visit_url')
    elif p['old_url'] and not p['new_url']:
        raw = rewrite(raw, p['old_url'], '#', 'visit_url->dead')

    # 7. Also replace old "Work: eHealth Arena" page title pattern if present
    raw = rewrite(raw, f'Work: {p["old_title"]}', f'Work: {p["new_title"]}', 'page_title')

    # Sanity check
    pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
    bad = sum(1 for m in pat.finditer(raw) if m.end() + int(m.group(2), 16) > len(raw))
    print(f'  T-prefix sanity: {"OK" if bad == 0 else f"ISSUES ({bad})"}')

    open(dest, 'wb').write(raw)

# ── update flight.js uids ─────────────────────────────────────────────────────

print(f'\n{"="*60}')
print('Updating flight.js uids...')
with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

for p in pages:
    old = f'\\"uid\\":\\"{p["old_slug"]}\\"'
    new = f'\\"uid\\":\\"{p["new_slug"]}\\"'
    count = s.count(old)
    s = s.replace(old, new)
    print(f'  {p["old_slug"]} -> {p["new_slug"]}: {count} replacement(s)')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)

# ── update home.json whitelist ────────────────────────────────────────────────

print(f'\n{"="*60}')
print('Updating home.json...')
with open('modules/home/content/home.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

slug_map = {p['old_slug']: p['new_slug'] for p in pages}
for item in data['projects']['items']:
    if item['uid'] in slug_map:
        new_slug = slug_map[item['uid']]
        print(f'  {item["uid"]} -> {new_slug}')
        item['uid'] = new_slug
        item['url'] = f'/work/{new_slug}'

with open('modules/home/content/home.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print('\nAll done.')
