import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function FilterDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return <Dialog>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className="inset-y-0 right-0 left-auto h-dvh max-h-dvh w-full max-w-[390px] translate-x-0 translate-y-0 content-start rounded-none border-b sm:max-w-[390px]">
      <DialogHeader className="pr-8"><DialogTitle>Filtros da demonstração</DialogTitle><DialogDescription>Selecione a rede para filtrar os cards desta página.</DialogDescription></DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
}
