import { readFileSync } from 'node:fs';
import dns from 'node:dns/promises';
import https from 'node:https';

/**
 * Diagnosa lengkap: DNS sistem, beberapa resolver publik, dan HTTPS langsung.
 * Jalankan: node scripts/diagnose-dns.mjs
 */

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z0-9_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const domain = 'nps.incentric.co.id';
const servers = ['1.1.1.1', '8.8.8.8', '9.9.9.9', '208.67.222.222', '4.2.2.1'];
const probeAddresses = ['216.198.79.1', '64.29.17.1'];

function request({ address, hostname, path = '/', method = 'GET', body = null, cookie = null, resolveHost = true }) {
  return new Promise((resolve) => {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131 Safari/537.36' };
    if (hostname) headers.Host = hostname;
    if (body) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    if (cookie) headers.Cookie = cookie;

    const req = https.request(
      {
        host: resolveHost ? hostname : address,
        servername: hostname,
        path,
        method,
        headers,
        timeout: 15000,
        lookup: (_h, _o, cb) => cb(null, [{ address, family: 4 }]),
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
      },
    );
    req.on('error', (error) => resolve({ error: error.code || error.message }));
    req.on('timeout', () => req.destroy(new Error('timeout')));
    if (body) req.write(body);
    req.end();
  });
}

function summarizeDonut(html) {
  const start = html.indexOf('Proporsi loyalitas');
  if (start < 0) return 'blok donut tidak ditemukan';
  const block = html.slice(start, start + 1600);
  const paths = [...block.matchAll(/<path d="[^"]+" fill="(#[0-9a-f]{6})"/gi)].map((m) => m[1]);
  const hasDash = /stroke-dasharray="[^"]*-/.test(block);
  return `${paths.length} potongan (${paths.join(' + ') || '-'}), dasharray negatif: ${hasDash}`;
}

async function main() {
  console.log('== 1. Resolver sistem (dipakai browser di komputer ini) ==');
  console.log('   server:', dns.getServers().join(', ') || '(tidak diketahui)');
  try {
    const found = await dns.lookup(domain, { all: true });
    console.log('   lookup:', found.map((a) => a.address).join(', '));
  } catch (error) {
    console.log('   lookup GAGAL:', error.code || error.message);
  }

  console.log('\n== 2. Resolver publik ==');
  for (const server of servers) {
    try {
      const resolver = new dns.Resolver({ timeout: 5000, tries: 1 });
      resolver.setServers([server]);
      const cname = await resolver.resolveCname(domain).catch(() => []);
      const addresses = await resolver.resolve4(domain).catch(() => []);
      console.log(`   ${server.padEnd(16)} CNAME ${cname.join(',') || '-'} → ${addresses.join(', ') || '-'}`);
    } catch (error) {
      console.log(`   ${server.padEnd(16)} GAGAL ${error.code || error.message}`);
    }
  }

  console.log('\n== 3. HTTPS dengan nama domain asli (SNI) ==');
  for (const address of probeAddresses) {
    const res = await request({ address, hostname: domain, path: '/login/rsananda' });
    console.log(`   ${address.padEnd(16)} ${res.error ? `ERROR ${res.error}` : `${res.status} ${res.headers.server || ''}`}`);
  }

  console.log('\n== 4. Uji login + isi dashboard ==');
  const password = env.NPS_PASSWORD_RSANANDA;
  const address = probeAddresses[0];
  const login = await request({
    address,
    hostname: domain,
    path: '/login/rsananda',
    method: 'POST',
    body: new URLSearchParams({ password }).toString(),
  });
  console.log('   login:', login.error || `${login.status} → ${login.headers?.location || '-'}`);

  const cookie = String(login.headers?.['set-cookie']?.[0] || '').split(';')[0];
  const page = await request({ address, hostname: domain, path: '/rsananda', cookie });
  console.log('   dashboard:', page.error || `${page.status}`);
  if (!page.error && page.body) {
    console.log('   donut:', summarizeDonut(page.body));
    console.log('   filter sejajar:', page.body.includes('shrink-0 whitespace-nowrap'));
  }

  console.log('\n== 5. Bandingkan dengan alamat .vercel.app ==');
  const vercelHost = 'incentric-nps.vercel.app';
  const vercelRes = await request({ address, hostname: vercelHost, path: '/login/rsananda' });
  console.log(`   ${vercelHost}:`, vercelRes.error || vercelRes.status);
}

main();
