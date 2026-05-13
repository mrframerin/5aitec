"""Extract RSC stream from a snapshot HTML file by parsing self.__next_f.push calls."""
import re, json, sys

def extract_rsc(html_bytes):
    # Find all self.__next_f.push([N, ...]) where N is the chunk type
    pattern = re.compile(rb'self\.__next_f\.push\(\[(\d+),(.*?)\]\)</script>', re.DOTALL)
    parts = []
    for m in pattern.finditer(html_bytes):
        chunk_type = m.group(1)
        if chunk_type != b'1':
            continue  # only type 1 carries RSC stream data
        raw_payload = m.group(2)
        # raw_payload is a JSON-encoded JS expression — typically a quoted string
        # Use json.loads to decode it
        try:
            decoded = json.loads(raw_payload.decode('utf-8'))
            if isinstance(decoded, str):
                parts.append(decoded)
        except Exception as e:
            print(f'parse error: {e} for {raw_payload[:80]}', file=sys.stderr)
    return ''.join(parts)

rsc = extract_rsc(open('public/work/shopos/index.html', 'rb').read())
print(f'extracted {len(rsc)} chars')
print('--- first 600 chars ---')
print(rsc[:600])
print('--- last 200 chars ---')
print(rsc[-200:])
