"""Replace each page's project-specific display title and body text
(the original brand name and its original description), which our earlier
template-field replacement missed.

Handles T-prefix RSC chunks so declared lengths stay valid, and both the
literal-apostrophe form (JSON-LD, RSC) and the HTML-entity form (meta tags).
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
        if occ == 0:
            continue
        new_content = content.replace(old, new)
        new_declared = c['declared'] + delta * occ
        new_hex = format(new_declared, 'x')
        new_prefix = f"{c['id']}:T{new_hex},".encode()
        out = out[:c['prefix_start']] + new_prefix + new_content + out[c['content_end']:]
    out = out.replace(old, new)  # any remaining outside-chunk
    return out

def rewrite(raw, old, new, label):
    old_b = old.encode('utf-8')
    new_b = new.encode('utf-8')
    before = raw.count(old_b)
    raw = length_aware_replace(raw, old_b, new_b)
    after = raw.count(old_b)
    print(f'  {label}: {before} -> {after} remaining')
    return raw

# Page-by-page replacements
pages = [
    {
        'slug':'seeit',
        'old_title':'Select Concept',
        'new_title':'SeeIt',
        'old_body':"Select Concept is a Swedish brand offering high-quality products for restaurants, hotels and cafes. We teamed up with them to conceptualize, design, and develop a user-friendly yet powerful 3D product planning tool, along with a new website. The tool includes over 100 modeled products, and gives the user the ability to freely design and plan their room, buffet tables and products within a realistic 3D environment. Once completed, the user can add the products to the cart and request a quote.",
        'new_body':"Open-source AI smart glasses. On-device memory. Built in public. AI wearables research lab where Glass 1 is audio-first and Glass 2 targets a monochrome AR display. AutoDream consolidation engine for memory across sessions. On-device, privacy-first AI - no cloud dependency. IRIS Explorer Edition co-branded with Lumio, 10,000-unit drop planned.",
    },
    {
        'slug':'spuddish',
        'old_title':'Gamily',
        'new_title':'Spuddish',
        'old_body':"Gamily is the dating and friend app designed for gamers who are looking for meaningful relationships with fellow gamers. We contributed to the development and deployment of the landing page. The webpage showcases the app's brand identity by integrating creative visual animations complemented by custom-built 3D assets.",
        'new_body':"Early-stage bets on the future of the web. Sai's personal venture fund focused on startups building the decentralized, generative, and immersive web. Backs founders building things worth making - deep-tech, spatial computing, open-source protocols, generative AI. Hands-on, not a passive LP check. Portfolio includes Sentient, Gibbon, Cope Studio, Dehidden, Nume Zk - and counting.",
    },
    {
        'slug':'omvara',
        'old_title':'Alamance Foods',
        'new_title':'Omvara',
        'old_body':"Alamance Foods make fun foods. We made their web page using creative design ideas complemented with their products in 3D. All models were made by us using Blender. For the programming of the models we used React Three Fiber. A particularly smart thing in this solution is the shader programming of the materials to make them behave realistically and still have high performance on slower devices.",
        'new_body':"Intentional fragrance. Built for stillness. A luxury perfume brand built with founder Shirali Chamola. Brand bible, 90-day execution tracker, and full identity system completed. Intentions is the debut line. Rooted in philosophy, ritual, and the quiet luxury of things that last - positioned at the intersection of slow brand building and deep-tech-informed marketing through ShopOS.",
    },
    {
        'slug':'scapic',
        'old_title':'Norrköpings Symfoniorkester',
        'new_title':'Scapic',
        'old_body':"We manage the entire web platform for Scenkonst Öst where Norrköping Symphony Orchestra is a part. The audience can browse concerts, book tickets, buy gift cards and much more.",
        'new_body':"The world's first no-code Metaverse platform. 300,000+ experiences. Acquired by Walmart and Flipkart.",
    },
    {
        'slug':'flipkart-camera',
        'old_title':'Glasbolaget',
        'new_title':'Flipkart Camera',
        'old_body':"We made a configurator for a company that sells glass in different forms. The user can create their own glass rails, walls and separate pieces using our 3D configurator. The prices are being fetched from an API so that we can calculate the total cost as the user designs. Some models have been modelled by hand and some are generated as the user modifies the parameters in the configurator.",
        'new_body':"World's largest AR commerce surface. Tens of millions of Indians visualizing products before buying.",
    },
    {
        'slug':'house-of-models',
        'old_title':'SPP Dream Generator',
        'new_title':'House of Models',
        'old_body':"What was supposed to be a one shot PR event became a lasting piece of the SPP website. The visitor takes a photo of him/herself and writes a short description of what the days would look like when retired from work. The program then generates a realistic video of the person in the dream that they described along with a description of what life could look like. A presentation page containing the video and description is emailed to the visitor. This PR stunt helped transfer customers to SPP on its own.",
        'new_body':"AI agent operating system for brand commerce.",
    },
    {
        'slug':'gibbon',
        'old_title':'ICA-nissen',
        'new_title':'Gibbon',
        'old_body':"ICA is one of Sweden's largest grocery stores. For Christmas 2024 we made an AR game for them where users could scan ICA's products and unlock features in the game. The game was developed with 8th wall which is the same software used in Pokemon GO. This makes the AR experience work fluently on both Android and iOS. Models and textures made with Blender.",
        'new_body':"Vision Pro spatial presentations.",
    },
    {
        'slug':'flipkart-labs',
        'old_title':'Norrköpings Hamn',
        'new_title':'Flipkart Labs',
        'old_body':"We created a real-time 3D visual experience detailing the physical journey and logistics of two shipping containers. The objective of this application was to provide users with a detailed and engaging insight into the complex operations conducted at the docks of Norrköping. The application was made with Next.js, React, and TypeScript. All 3D models were created with Blender and integrated into the web environment using React Three Fiber.",
        'new_body':"Moonshots - drones, AI, and EVs.",
    },
    {
        'slug':'cope-studio',
        'old_title':'HEIP',
        'new_title':'Cope Studio',
        'old_body':"This visualization was created for Händelö Eco-Industrial Park and shows how different factories and units exchange by-products, reducing waste and maximizing overall efficiency.",
        'new_body':"Web3 design and capital.",
    },
    {
        'slug':'dehidden',
        'old_title':'Design is Funny',
        'new_title':'Dehidden',
        'old_body':"Funny is the design work of Daniele Buffa, a Roman designer now based in London, UK. Buffa ('boo-f:ah) from the Italian means funny, comic, or droll. We helped develop the portfolio website, which is a sophisticated single-page application that features integrated interactive visuals and a progressive design structure.",
        'new_body':"NFT utility app store.",
    },
]

def html_entity_form(s):
    """Convert literal apostrophes to &#x27; (HTML-entity form used in meta tags)."""
    return s.replace("'", "&#x27;")

for p in pages:
    print(f'\n=== {p["slug"]} ===')
    fpath = f'public/work/{p["slug"]}/index.html'
    raw = open(fpath, 'rb').read()

    # title - replace literal
    raw = rewrite(raw, p['old_title'], p['new_title'], 'title')

    # body - both literal and entity-encoded forms
    raw = rewrite(raw, p['old_body'], p['new_body'], 'body(literal)')
    old_ent = html_entity_form(p['old_body'])
    new_ent = html_entity_form(p['new_body'])
    if old_ent != p['old_body']:
        raw = rewrite(raw, old_ent, new_ent, 'body(entity)')

    # Truncated meta-description: og:description, twitter:description, meta description
    # all show first ~157 chars + "..." with entity-encoded apostrophe
    old_short = html_entity_form(p['old_body'])[:155] + '...'
    new_short = html_entity_form(p['new_body'])
    if len(new_short) > 155:
        new_short = new_short[:155] + '...'
    raw = rewrite(raw, old_short, new_short, 'body(meta-trunc)')

    # sanity
    pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
    bad = sum(1 for m in pat.finditer(raw) if m.end() + int(m.group(2), 16) > len(raw))
    print(f'  T-prefix sanity: {"OK" if bad == 0 else f"BAD ({bad})"}')

    open(fpath, 'wb').write(raw)

print('\nAll display content updated.')
