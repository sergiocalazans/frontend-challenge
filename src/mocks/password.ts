export async function hashPassword(password:string,salt:string) {
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits'])
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100_000,hash:'SHA-256'},key,256)
  return Array.from(new Uint8Array(bits),byte => byte.toString(16).padStart(2,'0')).join('')
}
