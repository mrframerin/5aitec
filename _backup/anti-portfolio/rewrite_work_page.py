"""Replace a string in a Next.js work HTML page, updating any T-prefix
declared lengths so the RSC payload stays valid.

Usage:
    python rewrite_work_page.py <html_path> <old_str> <new_str>
"""
import os, re, sys

if len(sys.argv) != 4:
    print('usage: rewrite_work_page.py <html_path> <old_str> <new_str>')
    sys.exit(1)

p, old, new = sys.argv[1], sys.argv[2], sys.argv[3]

with open(p, 'rb') as f:
    raw = f.read()

old_b = old.encode('utf-8')
new_b = new.encode('utf-8')
delta_per_occurrence = len(new_b) - len(old_b)

# Find all T-prefix chunks: <id>:T<hex>,
# IDs are alphanumeric+underscore in the RSC stream (e.g. "17", "1a", "1c").
pat = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')

# Build a list of all chunks: (prefix_match_start, prefix_match_end, declared_bytes, content_start, content_end)
chunks = []
for m in pat.finditer(raw):
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

# Sanity: print plan
total_in_file = raw.count(old_b)
total_in_chunks = sum(raw[c['content_start']:c['content_end']].count(old_b) for c in chunks)
print(f'total occurrences of {old!r} in file       : {total_in_file}')
print(f'inside T-prefixed RSC chunks              : {total_in_chunks}')
print(f'outside (no length fix needed)            : {total_in_file - total_in_chunks}')
print(f'byte delta per occurrence ({old} -> {new}) : {delta_per_occurrence:+d}')
print()

# Work from end of file backwards so chunk byte offsets we still need stay correct
# when we rewrite the chunk content + prefix in-place.
out = raw
# Sort chunks by prefix_start descending so we mutate the tail first.
for c in sorted(chunks, key=lambda c: c['prefix_start'], reverse=True):
    content = out[c['content_start']:c['content_end']]
    occ = content.count(old_b)
    if occ == 0:
        continue
    new_content = content.replace(old_b, new_b)
    new_declared = c['declared'] + delta_per_occurrence * occ
    new_hex = format(new_declared, 'x')
    new_prefix = f"{c['id']}:T{new_hex},".encode()
    # Replace prefix + content together
    out = (
        out[:c['prefix_start']]
        + new_prefix
        + new_content
        + out[c['content_end']:]
    )
    print(f"  chunk {c['id']}: T{c['hex']} ({c['declared']}b) -> T{new_hex} ({new_declared}b), {occ} replacement(s)")

# Plain text replacements OUTSIDE any T-prefix chunk. We just do a full-file replace
# but the T-prefix chunks have already been handled (their internal occurrences are
# already swapped). To be safe: only replace bytes that aren't already overwritten.
# Simplest: replace remaining old_b -> new_b globally. Any old_b inside a T-prefix
# is already gone (we replaced it via new_content). Anything left is outside.
remaining = out.count(old_b)
if remaining:
    out = out.replace(old_b, new_b)
    print(f"  outside-chunk replacements (safe text) : {remaining}")

with open(p, 'wb') as f:
    f.write(out)

# Verify
new_raw = open(p, 'rb').read()
print()
print('after rewrite:')
print(f'  {old!r} remaining: {new_raw.count(old_b)}')
print(f'  {new!r} present  : {new_raw.count(new_b)}')

# Re-scan T-prefixes to verify each chunk's declared length matches actual content length to next prefix or EOF
pat2 = re.compile(rb'([0-9a-zA-Z_]+):T([0-9a-f]+),')
ms = list(pat2.finditer(new_raw))
bad = 0
for i, m in enumerate(ms):
    declared = int(m.group(2), 16)
    content_end_predicted = m.end() + declared
    # Quick spot-check: declared length should not push past file
    if content_end_predicted > len(new_raw):
        print(f'  WARN: chunk {m.group(1).decode()} declares {declared}b but file only has {len(new_raw)-m.end()}b left')
        bad += 1
print(f'  T-prefix sanity check: {"OK" if bad == 0 else "ISSUES"}')
