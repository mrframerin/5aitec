"""Stage uid changes in flight.js one at a time for safe testing.
Run with: python stage_uids_one_by_one.py <step>
step 0 = revert all (old slugs in flight.js)
step 1 = seeit only
step 2 = seeit + spuddish
... etc up to step 10 = all 10 active
"""
import sys

pairs = [
    ('select-concept', 'seeit'),
    ('gamily',         'spuddish'),
    ('alamance-foods', 'omvara'),
    ('son',            'scapic'),
    ('glasbolaget',    'flipkart-camera'),
    ('spp-dream-generator', 'house-of-models'),
    ('ica-nissen',     'gibbon'),
    ('norrkopings-hamn','flipkart-labs'),
    ('heip',           'cope-studio'),
    ('design-is-funny','dehidden'),
]

step = int(sys.argv[1]) if len(sys.argv) > 1 else 0

with open('public/flight.js', 'r', encoding='utf-8') as f:
    s = f.read()

for i, (old, new) in enumerate(pairs):
    if i < step:
        # activate new slug
        s = s.replace(f'\\"uid\\":\\"{old}\\"', f'\\"uid\\":\\"{new}\\"')
        # make sure old is gone
        print(f'  ACTIVE  : {new}')
    else:
        # keep/revert to old slug
        s = s.replace(f'\\"uid\\":\\"{new}\\"', f'\\"uid\\":\\"{old}\\"')
        print(f'  inactive: {old}')

with open('public/flight.js', 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print(f'Done — step {step}/{len(pairs)}')
