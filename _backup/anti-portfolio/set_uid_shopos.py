"""Set uid to shopos in flight.js (url is already /work/shopos)."""
with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

old = '\\"uid\\":\\"ehealth-arena\\"'
new = '\\"uid\\":\\"shopos\\"'
count = s.count(old)
s = s.replace(old, new)
print(f'flight.js uid: {count} replacement(s)')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)

with open('public/flight.js', 'r', encoding='utf-8') as f:
    chk = f.read()
print(f'  ehealth-arena remaining: {chk.count("ehealth-arena")}')
print(f'  shopos present         : {chk.count("shopos")}')
