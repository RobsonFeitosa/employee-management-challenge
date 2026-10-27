'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { EmployeeFormDialog } from './employee-form-dialog'

export function EmployeesPage() {
  const [isCreating, setIsCreating] = useState(false)

  return (
    <main className="container space-y-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Funcionários
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro, jornada e tempo de casa da equipe.
          </p>
        </div>

        <Button onClick={() => setIsCreating(true)}>
          <Plus /> Novo funcionário
        </Button>
      </header>

      <EmployeeFormDialog open={isCreating} onOpenChange={setIsCreating} />
    </main>
  )
}
