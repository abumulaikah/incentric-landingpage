/** Hash password client dengan scrypt (Node crypto). */

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function scrypt(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const { scrypt: nodeScrypt } = await import('node:crypto');
  const derived = await new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(password.normalize('NFKC'), salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
  return new Uint8Array(derived);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await scrypt(password, salt);
  return `scrypt$${toBase64(salt)}$${toBase64(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltValue, hashValue] = stored.split('$');
  if (scheme !== 'scrypt' || !saltValue || !hashValue) return false;

  const derived = await scrypt(password, fromBase64(saltValue));
  const expected = fromBase64(hashValue);
  if (derived.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < derived.length; index++) mismatch |= derived[index] ^ expected[index];
  return mismatch === 0;
}
