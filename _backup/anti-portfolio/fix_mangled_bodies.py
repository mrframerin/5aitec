"""Fix the three pages where title replacement was applied to body text first,
producing mangled bodies like 'SeeIt is a Swedish brand...' instead of replacing
the entire body with the proper new content.
"""
import os, re

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
        if occ == 0: continue
        new_content = content.replace(old, new)
        new_declared = c['declared'] + delta * occ
        new_hex = format(new_declared, 'x')
        new_prefix = f"{c['id']}:T{new_hex},".encode()
        out = out[:c['prefix_start']] + new_prefix + new_content + out[c['content_end']:]
    out = out.replace(old, new)
    return out

def rewrite(raw, old, new, label):
    old_b = old.encode('utf-8'); new_b = new.encode('utf-8')
    before = raw.count(old_b)
    raw = length_aware_replace(raw, old_b, new_b)
    print(f'  {label}: {before} -> {raw.count(old_b)} remaining')
    return raw

# Bodies are now mangled: title inside body got replaced.
pages = [
    {
        'slug':'seeit',
        'old_body':"SeeIt is a Swedish brand offering high-quality products for restaurants, hotels and cafes. We teamed up with them to conceptualize, design, and develop a user-friendly yet powerful 3D product planning tool, along with a new website. The tool includes over 100 modeled products, and gives the user the ability to freely design and plan their room, buffet tables and products within a realistic 3D environment. Once completed, the user can add the products to the cart and request a quote.",
        'new_body':"Open-source AI smart glasses. On-device memory. Built in public. AI wearables research lab where Glass 1 is audio-first and Glass 2 targets a monochrome AR display. AutoDream consolidation engine for memory across sessions. On-device, privacy-first AI - no cloud dependency. IRIS Explorer Edition co-branded with Lumio, 10,000-unit drop planned.",
    },
    {
        'slug':'spuddish',
        'old_body':"Spuddish is the dating and friend app designed for gamers who are looking for meaningful relationships with fellow gamers. We contributed to the development and deployment of the landing page. The webpage showcases the app's brand identity by integrating creative visual animations complemented by custom-built 3D assets.",
        'new_body':"Early-stage bets on the future of the web. Sai's personal venture fund focused on startups building the decentralized, generative, and immersive web. Backs founders building things worth making - deep-tech, spatial computing, open-source protocols, generative AI. Hands-on, not a passive LP check. Portfolio includes Sentient, Gibbon, Cope Studio, Dehidden, Nume Zk - and counting.",
    },
    {
        'slug':'omvara',
        'old_body':"Omvara make fun foods. We made their web page using creative design ideas complemented with their products in 3D. All models were made by us using Blender. For the programming of the models we used React Three Fiber. A particularly smart thing in this solution is the shader programming of the materials to make them behave realistically and still have high performance on slower devices.",
        'new_body':"Intentional fragrance. Built for stillness. A luxury perfume brand built with founder Shirali Chamola. Brand bible, 90-day execution tracker, and full identity system completed. Intentions is the debut line. Rooted in philosophy, ritual, and the quiet luxury of things that last - positioned at the intersection of slow brand building and deep-tech-informed marketing through ShopOS.",
    },
]

def entity(s): return s.replace("'", "&#x27;")

for p in pages:
    print(f'\n=== {p["slug"]} ===')
    fpath = f'public/work/{p["slug"]}/index.html'
    raw = open(fpath, 'rb').read()

    raw = rewrite(raw, p['old_body'], p['new_body'], 'body(literal)')
    if entity(p['old_body']) != p['old_body']:
        raw = rewrite(raw, entity(p['old_body']), entity(p['new_body']), 'body(entity)')

    old_short = entity(p['old_body'])[:155] + '...'
    new_short = entity(p['new_body'])
    if len(new_short) > 155: new_short = new_short[:155] + '...'
    raw = rewrite(raw, old_short, new_short, 'body(meta-trunc)')

    pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
    bad = sum(1 for m in pat.finditer(raw) if m.end() + int(m.group(2), 16) > len(raw))
    print(f'  T-prefix sanity: {"OK" if bad == 0 else "BAD"}')
    open(fpath, 'wb').write(raw)

print('\nDone.')
