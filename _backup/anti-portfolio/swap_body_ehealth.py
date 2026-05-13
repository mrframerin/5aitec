"""Swap the body description on the ehealth-arena page for ShopOS copy.
Handles both the full description and the truncated meta-tag variant,
with T-prefix length recompute.
"""
import os, re

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'work', 'ehealth-arena', 'index.html')

with open(p, 'rb') as f:
    raw = f.read()

# Full description (visible body + JSON-LD + RSC)
old_full = (
    "We created an interactive 3D platform that explores how the latest "
    "e-health solutions work in practice. From the patient's home to "
    "hospital environments and care providers' workplaces. Users can follow "
    "real care journeys, and understand how it all connects to create safer, "
    "more efficient care."
).encode('utf-8')

new_full = (
    "ShopOS is the full-stack AI operating system for D2C and Shopify "
    "brands - not another chatbot wrapper. ARIA orchestrates a named agent "
    "roster, each owning a domain across content, ad copy, product launches, "
    "and CRM workflows. Brand Memory means the AI actually knows the brand, "
    "not just the prompt."
).encode('utf-8')

# Truncated meta-tag variant (HTML entity apostrophe, ends with " home to...")
old_trunc = (
    "We created an interactive 3D platform that explores how the latest "
    "e-health solutions work in practice. From the patient&#x27;s home to..."
).encode('utf-8')

new_trunc = (
    "ShopOS is the full-stack AI operating system for D2C and Shopify "
    "brands - not another chatbot wrapper. ARIA orchestrates a named agent..."
).encode('utf-8')

def length_aware_replace(raw_bytes, old, new):
    delta = len(new) - len(old)
    # Find all T-prefix chunks
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
    # Operate from end to start so byte indices stay valid as we mutate
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
    # Remaining (outside any T-chunk)
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

# Sanity
print()
chk = open(p, 'rb').read()
print(f"old_full remaining       : {chk.count(old_full)}")
print(f"new_full present         : {chk.count(new_full)}")
print(f"old_trunc remaining      : {chk.count(old_trunc)}")
print(f"new_trunc present        : {chk.count(new_trunc)}")

# T-prefix sanity
pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
ms = list(pat.finditer(chk))
bad = 0
for m in ms:
    declared = int(m.group(2), 16)
    if m.end() + declared > len(chk):
        bad += 1
        print(f"  WARN chunk {m.group(1).decode()}: declared {declared}b overruns file")
print(f"T-prefix sanity: {'OK' if bad == 0 else 'ISSUES'}")
