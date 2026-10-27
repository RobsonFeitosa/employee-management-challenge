'use client'

import { AlertCircle, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployees } from '@/hooks/use-employees'
import { getErrorMessage } from '@/lib/api'
import type { Employee } from '@/lib/employees/types'

import { DeleteEmployeeDialog } from './delete-employee-dialog'
import { EmployeeFormDialog } from './employee-form-dialog'
import { EmployeesEmptyState } from './employees-empty-state'
import { EmployeesTable } from './employees-table'

/** `null` = fechado; `{}` = cadastro; `{ employee }` = edição. */
type FormState = { employee?: Employee } | null

export function EmployeesPage() {
  const { data: employees, isPending, isError, error, refetch } = useEmployees()
  const [formState, setFormState] = useState<FormState>(null)
  const [toDelete, setToDelete] = useState<Employee | null>(null)

  const openCreate = () => setFormState({})

  function renderContent() {
    if (isPending) {
      return (
        <div className="space-y-3 p-6" aria-label="Carregando funcionários">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="font-medium">Não foi possível carregar a lista</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )
    }

    if (employees.length === 0) {
      return <EmployeesEmptyState onCreate={openCreate} />
    }

    return (
      <EmployeesTable
        employees={employees}
        onEdit={(employee) => setFormState({ employee })}
        onDelete={setToDelete}
      />
    )
  }

  return (
    <main className="container space-y-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Funcionários
          </h1>
          <p className="text-sm text-muted-foreground">
            {employees?.length
              ? `${employees.length} ${employees.length === 1 ? 'funcionário' : 'funcionários'}, ordenados pela data de admissão.`
              : 'Cadastro, jornada e tempo de casa da equipe.'}
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus /> Novo funcionário
        </Button>
      </header>

      <Card className="overflow-hidden">{renderContent()}</Card>

      <EmployeeFormDialog
        open={formState !== null}
        onOpenChange={(open) => !open && setFormState(null)}
        employee={formState?.employee}
      />

      <DeleteEmployeeDialog
        employee={toDelete}
        onClose={() => setToDelete(null)}
      />
    </main>
  )
}
