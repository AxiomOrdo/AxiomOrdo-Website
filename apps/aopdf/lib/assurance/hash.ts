const HEX = '0123456789abcdef';

export async function sha256Hex(input: ArrayBuffer | Uint8Array): Promise<string> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const copy = Uint8Array.from(bytes);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', copy.buffer));
  let output = '';
  for (const value of digest) {
    output += HEX[value >> 4] + HEX[value & 15];
  }
  return output;
}

export function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}
