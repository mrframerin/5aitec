import re, json
raw = open('public/work/shopos/index.html', 'rb').read()
# find all self.__next_f.push calls and extract the second arg
pattern = re.compile(rb'self\.__next_f\.push\(\[(\d+),(.*?)\]\)</script>')
pushes = pattern.findall(raw)
print(f'total push calls: {len(pushes)}')
for i, (num, data) in enumerate(pushes[:4]):
    print(f'--- push {i}: type={num.decode()}, raw_len={len(data)} ---')
    print(data[:250])
    print()

# shader.se comparison
print('=== shader.se RSC ===')
shader = open('/tmp/shader_rsc.txt', 'rb').read()
print(shader[:400])
