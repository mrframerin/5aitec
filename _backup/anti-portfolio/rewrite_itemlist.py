"""Fix the JSON-LD ItemList block in public/flight.js."""
import re, os

p = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'flight.js')
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def js_escape(v):
    return v.replace('\\', '\\\\').replace('"', '\\"')

itemlist = {
    'eHealth Arena':                'ShopOS',
    'Select Concept':               'SeeIt',
    'Gamily':                       'Spuddish',
    'Alamance Foods':               'Omvara',
    'Norrköpings Symfoniorkester': 'Scapic',
    'Glasbolaget':                  'Flipkart Camera',
    'SPP Dream Generator':          'House of Models',
    'ICA-nissen':                   'Gibbon',
    'Norrköpings Hamn':        'Flipkart Labs',
    'HEIP':                         'Cope Studio',
    'Design is Funny':              'Dehidden',
}
total = 0
for old, new in itemlist.items():
    # raw bytes in file are: \"name\":\"<old>\"  (each \" is two chars: backslash + quote)
    pat = r'\\"name\\":\\"' + re.escape(old) + r'\\"'
    repl = r'\\"name\\":\\"' + js_escape(new) + r'\\"'
    s, n = re.subn(pat, repl, s)
    total += n
    print(f'  {old!r}: {n}')

with open(p, 'w', encoding='utf-8', newline='') as f:
    f.write(s)
print('ItemList total:', total)
