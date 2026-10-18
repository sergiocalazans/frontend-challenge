import { readFile, mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const source = await readFile('design/svg/Frontend Challenge.svg', 'utf8')
const images = [...source.matchAll(/<image\b[^>]*id="([^"]+)"[^>]*xlink:href="data:image\/png;base64,([^"]+)"[^>]*>/g)]
const names = ['emerald-ape', 'sage-nomad', 'neon-vessel', 'golden-beat']
if (images.length !== 4) throw new Error('Expected the four original embedded images')
await mkdir('public/images', { recursive: true })
for (const [index, match] of images.entries()) {
  const image = await sharp(Buffer.from(match[2], 'base64')).resize(640, 640).webp({ quality: 85 }).toBuffer()
  await writeFile(`public/images/${names[index]}.webp`, image)
}
console.log('Extracted four individual images; original SVG unchanged.')
