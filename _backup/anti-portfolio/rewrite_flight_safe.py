"""Safer rewrite of public/flight.js carousel content (ASCII-only)."""
import os, re

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'flight.js')
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

# (uid, old_title, old_subtitle, old_description, new_title, new_subtitle, new_description)
items = [
    ('ehealth-arena',
     'eHealth Arena', '3D Showroom',
     "We created an interactive 3D platform that explores how the latest e-health solutions work in practice. From the patient's home to hospital environments and care providers' workplaces. Users can follow real care journeys, and understand how it all connects to create safer, more efficient care.",
     'ShopOS', 'AI Agent OS - Active',
     'Owning AI outcomes for brands. Building agents and coworkers to get it done. Backed by Binny Bansal.'),
    ('select-concept',
     'Select Concept', '3D Interior Designer',
     "Select Concept is a Swedish brand offering high-quality products for restaurants, hotels and cafes. We teamed up with them to conceptualize, design, and develop a user-friendly yet powerful 3D product planning tool, along with a new website.",
     'SeeIt', 'AI Smart Glasses - IRIS Labs',
     'Open-source AI smart glasses. On-device memory. Built in public.'),
    ('gamily',
     'Gamily', 'Campaign Website',
     "Gamily is the dating and friend app designed for gamers who are looking for meaningful relationships with fellow gamers.",
     'Spuddish', 'Venture Fund - Active',
     'Early-stage bets on the future of the web. Personal fund, hands-on, not a passive LP check.'),
    ('alamance-foods',
     'Alamance Foods', 'Website',
     "Alamance Foods make fun foods. We made their web page using creative design ideas complemented with their products in 3D.",
     'Omvara', 'Luxury Fragrance - Active',
     'Intentional fragrance. Built for stillness.'),
    ('son',
     'Norrköpings Symfoniorkester', 'Website',
     "We manage the entire web platform for Scenkonst Öst where Norrköping Symphony Orchestra is a part. The audience can browse concerts, book tickets, buy gift cards and much more.",
     'Scapic', 'No-code Metaverse - Exit to Walmart',
     "The world's first no-code Metaverse platform. 300,000+ experiences. Acquired by Walmart | Flipkart."),
    ('glasbolaget',
     'Glasbolaget', '3D Configurator',
     "We made a configurator for a company that sells glass in different forms. The user can create their own glass rails, walls and separate pieces using our 3D configurator. The prices are being fetched from an API so that we can calculate the total cost as the user designs.",
     'Flipkart Camera', 'AR Commerce',
     "World's largest AR commerce surface. Tens of millions of Indians visualizing products before buying."),
    ('spp-dream-generator',
     'SPP Dream Generator', 'AI Image and Video Generator',
     "What was supposed to be a one shot PR event became a lasting piece of the SPP website. The visitor takes a photo of him/herself and writes a short description of what the days would look like when retired from work.",
     'House of Models', 'AI Agent OS for Brand Commerce',
     'AI agent OS purpose-built for brand commerce workflows.'),
    ('ica-nissen',
     'ICA-nissen', 'AR Game',
     "ICA is one of Sweden's largest grocery stores. For Christmas 2024 we made an AR game for them where users could scan ICA's products and unlock features in the game.",
     'Gibbon', 'Vision Pro - Spatial Presentations',
     'Spatial presentations built for Vision Pro.'),
    ('norrkopings-hamn',
     'Norrköpings Hamn', '3D Flow Visualization',
     "We created a real-time 3D visual experience detailing the physical journey and logistics of two shipping containers. The objective of this application was to provide users with a detailed and engaging insight into the complex operations conducted at the docks of Norrköping.",
     'Flipkart Labs', 'Moonshots - Drones, AI, EVs',
     "Drones, AI, EVs. Flipkart's moonshot R&D arm."),
    ('heip',
     'HEIP', '3D Visualisation',
     "This visualization was created for Händelö Eco-Industrial Park and shows how different factories and units exchange by-products, reducing waste and maximizing overall efficiency.",
     'Cope Studio', 'Web3 Design + Capital',
     'Web3 design studio with venture capital baked in.'),
    ('design-is-funny',
     'Design is Funny', 'Portfolio',
     "Funny is the design work of Daniele Buffa, a Roman designer now based in London, UK. Buffa ('boo-f:ah) from the Italian means funny, comic, or droll.",
     'Dehidden', 'NFT Utility App Store',
     'An app store for NFT utility.'),
]

def js_escape(v):
    return v.replace('\\', '\\\\').replace('"', '\\"')

total = 0
for uid, ot, os_, od, nt, ns, nd in items:
    pairs = [
        ('\\"title\\":\\"' + js_escape(ot) + '\\"',     '\\"title\\":\\"' + js_escape(nt) + '\\"'),
        ('\\"subtitle\\":\\"' + js_escape(os_) + '\\"', '\\"subtitle\\":\\"' + js_escape(ns) + '\\"'),
        ('\\"description\\":\\"' + js_escape(od) + '\\"', '\\"description\\":\\"' + js_escape(nd) + '\\"'),
    ]
    item_changes = 0
    for old, new in pairs:
        before = s
        s = s.replace(old, new, 1)
        if s != before:
            item_changes += 1
    if item_changes != 3:
        print(f'  PARTIAL ({item_changes}/3): {uid}')
    else:
        print(f'  ok: {uid} -> {nt}')
    total += item_changes

# ItemList JSON-LD names
itemlist = [
    ('eHealth Arena',                'ShopOS'),
    ('Select Concept',               'SeeIt'),
    ('Gamily',                       'Spuddish'),
    ('Alamance Foods',               'Omvara'),
    ('Norrköpings Symfoniorkester', 'Scapic'),
    ('Glasbolaget',                  'Flipkart Camera'),
    ('SPP Dream Generator',          'House of Models'),
    ('ICA-nissen',                   'Gibbon'),
    ('Norrköpings Hamn',        'Flipkart Labs'),
    ('HEIP',                         'Cope Studio'),
    ('Design is Funny',              'Dehidden'),
]
for old, new in itemlist:
    pat = '\\"name\\":\\"' + js_escape(old) + '\\"'
    rep = '\\"name\\":\\"' + js_escape(new) + '\\"'
    before = s
    s = s.replace(pat, rep, 1)
    print(f'  ItemList {old!r} -> {new}: {"yes" if s != before else "MISS"}')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print(f'done. field replacements: {total}/33')
