import { useState } from 'react'
import { Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { NftDetail } from './contracts'
const views = [{ name: 'Obra completa', scale: '' }, { name: 'Detalhe superior', scale: 'scale-150 origin-top' }, { name: 'Detalhe central', scale: 'scale-150' }]
export function NftGallery({ nft }: { nft: NftDetail }) {
  const [view, setView] = useState(0)
  return <div className="relative flex min-w-0 flex-col-reverse gap-4 lg:flex-row">
    <div role="group" aria-label="Vistas da obra" className="absolute bottom-5 left-5 z-10 flex gap-3 lg:static lg:w-20 lg:shrink-0 lg:flex-col">{views.map((item, index) => <button key={item.name} className="size-11 overflow-hidden rounded-md border-2 bg-card aria-pressed:border-primary lg:size-20" aria-label={item.name} aria-pressed={view === index} onClick={() => setView(index)}><img src={nft.image} alt="" width={80} height={80} className={`aspect-square object-cover ${item.scale}`} /></button>)}</div>
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-card p-4"><div className="aspect-square overflow-hidden rounded-xl"><img src={nft.image} alt={`${nft.imageAlt} — ${views[view]!.name}`} width={640} height={640} fetchPriority="high" className={`aspect-square h-full w-full object-cover ${views[view]!.scale}`} /></div>
      <Dialog><DialogTrigger asChild><Button variant="outline" size="icon" aria-label="Ampliar obra" className="absolute right-5 top-5 rounded-full"><Expand aria-hidden /></Button></DialogTrigger><DialogContent className="sm:max-w-[720px]"><DialogTitle>{nft.name}</DialogTitle><DialogDescription>Imagem original da obra. As miniaturas mostram recortes desta mesma imagem.</DialogDescription><img src={nft.image} alt={nft.imageAlt} width={640} height={640} className="max-h-[65dvh] w-full rounded-lg object-contain" /></DialogContent></Dialog>
    </div>
  </div>
}
