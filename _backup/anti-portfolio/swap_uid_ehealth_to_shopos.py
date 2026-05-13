"""Update flight.js: change uid/url references from ehealth-arena to shopos."""
with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

replacements = [
    ('\\"uid\\":\\"ehealth-arena\\"', '\\"uid\\":\\"shopos\\"'),
    ('\\"url\\":\\"/work/ehealth-arena\\"', '\\"url\\":\\"/work/shopos\\"'),
    ('shader.se/work/ehealth-arena', 'shader.se/work/shopos'),
]

for old, new in replacements:
    count = s.count(old)
    s = s.replace(old, new)
    print(f'  {count} replacement(s): {repr(old[:50])}')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print('Done')

# Verify
with open('public/flight.js', 'r', encoding='utf-8') as f:
    chk = f.read()
print(f'ehealth-arena remaining: {chk.count("ehealth-arena")}')
print(f'shopos present         : {chk.count("shopos")}')
