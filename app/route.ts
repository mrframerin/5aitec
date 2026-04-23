const BASE = "/_next/static/chunks";

const CHUNKS = [
  "03~yq9q893hmn.js",
  "turbopack-06237-s6b4.it.js",
  "0_4n59_u4tn.y.js",
  "07k6izpr80.um.js",
  "0f9pmwk9~iqf..js",
  "17.79-onzp9ko.js",
  "01rpcm9oxyz4o.js",
  "03r54qy_a1k2c.js",
  "12vmxu4i7-3qm.js",
  "0_2dh_hbsn4k2.js",
  "09d2g3rtnbzgs.js",
  "003qcun9_z40b.js",
  "0nr6lqdt2xw72.js",
  "0-4avss~~5x31.js",
];

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>shader.se</title>
<link rel="icon" href="/icon.svg" />
<link rel="stylesheet" href="/main.css" />
<script>window.next=window.next||{};</script>
<script src="/flight.js"></script>
${CHUNKS.map((name) => `<script src="${BASE}/${name}"></script>`).join("\n")}
</head>
<body></body>
</html>`;

export function GET() {
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
