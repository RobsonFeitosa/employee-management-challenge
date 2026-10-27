import { Plus, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function EmployeesEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Users className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">Nenhum funcionário cadastrado</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Cadastre o primeiro funcionário para acompanhar jornada, tempo de casa e
        periodicidade de fechamento.
      </p>
      <Button onClick={onCreate} className="mt-2">
        <Plus /> Cadastrar funcionário
      </Button>
    </div>
  )
}
