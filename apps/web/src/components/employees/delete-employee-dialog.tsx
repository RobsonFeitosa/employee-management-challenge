'use client'

import { toast } from 'sonner'

import { useDeleteEmployee } from '@/hooks/use-employees'
import { getErrorMessage } from '@/lib/api'
import type { Employee } from '@/lib/employees/types'

import { ConfirmDialog } from './confirm-dialog'
import { EmployeeSummary } from './employee-summary'

interface DeleteEmployeeDialogProps {
  employee: Employee | null
  onClose: () => void
}

export function DeleteEmployeeDialog({
  employee,
  onClose,
}: DeleteEmployeeDialogProps) {
  const remove = useDeleteEmployee()

  function handleConfirm() {
    if (!employee) return

    remove.mutate(employee.id, {
      onSuccess: () => {
        toast.success('Funcionário excluído')
        onClose()
      },
      onError: (error) =>
        toast.error('Não foi possível excluir', {
          description: getErrorMessage(error),
        }),
    })
  }

  return (
    <ConfirmDialog
      open={employee !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Excluir funcionário?"
      description="Esta ação não pode ser desfeita. O registro abaixo será removido permanentemente."
      confirmLabel="Excluir"
      destructive
      onConfirm={handleConfirm}
      isPending={remove.isPending}
    >
      {employee && <EmployeeSummary employee={employee} />}
    </ConfirmDialog>
  )
}
