"""Replace the placeholder ShopOS body with the full brief content."""
import os, re

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'work', 'ehealth-arena', 'index.html')

with open(p, 'rb') as f:
    raw = f.read()

# Current full body (placeholder)
old_full = (
    "ShopOS is the full-stack AI operating system for D2C and Shopify "
    "brands - not another chatbot wrapper. ARIA orchestrates a named agent "
    "roster, each owning a domain across content, ad copy, product launches, "
    "and CRM workflows. Brand Memory means the AI actually knows the brand, "
    "not just the prompt."
).encode('utf-8')

# New full body (the brief, flowed, ASCII-only)
new_full = (
    "Owning AI outcomes for brands - building agents and coworkers to get "
    "it done. ShopOS is a full-stack AI operating system for D2C and "
    "Shopify brands: Brand Memory, Spaces, Loops, Cowork, Connectors - one "
    "platform, not a point tool. Built for fashion, quick commerce, and "
    "apparel brands done with generic AI wrappers, wanting agents that "
    "actually ship outcomes (content briefs, ad copy, product launches, "
    "CRM workflows). Not another chatbot - ARIA orchestrates a named agent "
    "roster (Richard, Monica, Erlich, Gavin, Dinesh, Jared), each owning "
    "a domain. Brand Memory means the AI knows the brand, not just the "
    "prompt. Backed by Binny Bansal (Flipkart co-founder); design partners "
    "include Agilitas, Celio, Lenovo, and Brevo."
).encode('utf-8')

# Current truncated meta variant
old_trunc = (
    "ShopOS is the full-stack AI operating system for D2C and Shopify "
    "brands - not another chatbot wrapper. ARIA orchestrates a named agent..."
).encode('utf-8')

# New truncated meta variant
new_trunc = (
    "Owning AI outcomes for brands - building agents and coworkers to get "
    "it done. ShopOS is a full-stack AI operating system for D2C and..."
).encode('utf-8')

def length_aware_replace(raw_bytes, old, new):
    delta = len(new) - len(old)
    pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
    chunks = []
    for m in pat.finditer(raw_bytes):
        declared = int(m.group(2), 16)
        chunks.append({
            'id': m.group(1).decode(),
            'prefix_start': m.start(),
            'prefix_end': m.end(),
            'declared': declared,
            'content_start': m.end(),
            'content_end': m.end() + declared,
            'hex': m.group(2).decode(),
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
        out = (out[:c['prefix_start']] + new_prefix + new_content +
               out[c['content_end']:])
        print(f"  chunk {c['id']}: T{c['hex']} -> T{new_hex}, {occ} replacement(s)")
    remaining = out.count(old)
    if remaining:
        out = out.replace(old, new)
        print(f"  outside-chunk replacements (safe text): {remaining}")
    return out

print("=== full description ===")
raw = length_aware_replace(raw, old_full, new_full)
print()
print("=== truncated meta variant ===")
raw = length_aware_replace(raw, old_trunc, new_trunc)

with open(p, 'wb') as f:
    f.write(raw)

chk = open(p, 'rb').read()
print()
print(f"old_full remaining : {chk.count(old_full)}")
print(f"new_full present   : {chk.count(new_full)}")
print(f"old_trunc remaining: {chk.count(old_trunc)}")
print(f"new_trunc present  : {chk.count(new_trunc)}")

pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
ms = list(pat.finditer(chk))
bad = 0
for m in ms:
    declared = int(m.group(2), 16)
    if m.end() + declared > len(chk):
        bad += 1
        print(f"  WARN chunk {m.group(1).decode()}: declared {declared}b overruns file")
print(f"T-prefix sanity: {'OK' if bad == 0 else 'ISSUES'}")
