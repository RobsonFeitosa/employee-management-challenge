'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSaveEmployee } from '@/hooks/use-employees'
import { getErrorMessage } from '@/lib/api'
import { toEmployeeFormInput, toEmployeeInput } from '@/lib/employees/schema'
import type { Employee, EmployeeInput } from '@/lib/employees/types'

import { ConfirmDialog } from './confirm-dialog'
import { EmployeeForm } from './employee-form'
import { EmployeeSummary } from './employee-summary'

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Ausente = cadastro; presente = edição. */
  employee?: Employee
}

const FORM_ID = 'employee-form'

/** Formulário em modal → modal de confirmação com resumo → salva. */
export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: EmployeeFormDialogProps) {
  const [pending, setPending] = useState<EmployeeInput | null>(null)
  const save = useSaveEmployee()
  const isEdit = employee !== undefined

  function handleConfirm() {
    if (!pending) return

    save.mutate(
      { id: employee?.id, data: pending },
      {
        onSuccess: () => {
          toast.success(
            isEdit ? 'Funcionário atualizado' : 'Funcionário cadastrado',
          )
          setPending(null)
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error('Não foi possível salvar', {
            description: getErrorMessage(error),
          })
          setPending(null)
        },
      },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar funcionário' : 'Novo funcionário'}
            </DialogTitle>
            <DialogDescription>
              Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          {/* `key` remonta o form a cada abertura, descartando rascunhos. */}
          {open && (
            <EmployeeForm
              key={employee?.id ?? 'new'}
              id={FORM_ID}
              defaultValues={employee && toEmployeeFormInput(employee)}
              onSubmit={(values) => setPending(toEmployeeInput(values))}
              footer={
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {isEdit ? 'Salvar alterações' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(next) => !next && setPending(null)}
        title={isEdit ? 'Confirmar alterações?' : 'Confirmar cadastro?'}
        description={
          isEdit
            ? 'Revise os dados. Os campos alterados estão destacados.'
            : 'Revise os dados do novo funcionário antes de salvar.'
        }
        confirmLabel={isEdit ? 'Confirmar alterações' : 'Confirmar cadastro'}
        onConfirm={handleConfirm}
        isPending={save.isPending}
      >
        {pending && <EmployeeSummary employee={pending} previous={employee} />}
      </ConfirmDialog>
    </>
  )
}
