"""Change only the url field (not uid) in flight.js, and add shopos to home.json whitelist."""
import json, copy

# 1. flight.js: change url field only
with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

old = '\\"url\\":\\"/work/ehealth-arena\\"'
new = '\\"url\\":\\"/work/shopos\\"'
count = s.count(old)
s = s.replace(old, new)
print(f'flight.js: {count} url replacement(s)')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)

# verify uid untouched
with open('public/flight.js', 'r', encoding='utf-8') as f:
    chk = f.read()
print(f'  uid ehealth-arena still present: {chk.count("ehealth-arena")}')
print(f'  url /work/shopos present        : {chk.count("/work/shopos")}')

# 2. home.json: add shopos uid to whitelist (duplicate of ehealth-arena entry but uid=shopos)
with open('modules/home/content/home.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

items = data['projects']['items']
ehealth = next((p for p in items if p['uid'] == 'ehealth-arena'), None)

# Add shopos entry if not already there
if not any(p['uid'] == 'shopos' for p in items):
    shopos_entry = copy.deepcopy(ehealth)
    shopos_entry['uid'] = 'shopos'
    shopos_entry['url'] = '/work/shopos'
    items.insert(0, shopos_entry)
    print(f'home.json: added shopos whitelist entry')
else:
    print(f'home.json: shopos entry already exists')

with open('modules/home/content/home.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('Done')
