"""Revert flight.js uid/url back to ehealth-arena."""
with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

replacements = [
    ('\\"uid\\":\\"shopos\\"', '\\"uid\\":\\"ehealth-arena\\"'),
    ('\\"url\\":\\"/work/shopos\\"', '\\"url\\":\\"/work/ehealth-arena\\"'),
    ('shader.se/work/shopos', 'shader.se/work/ehealth-arena'),
]

for old, new in replacements:
    count = s.count(old)
    s = s.replace(old, new)
    print(f'  {count} replacement(s): {repr(old[:50])}')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)

with open('public/flight.js', 'r', encoding='utf-8') as f:
    chk = f.read()
print(f'shopos remaining     : {chk.count("shopos")}')
print(f'ehealth-arena present: {chk.count("ehealth-arena")}')
print('Done')
