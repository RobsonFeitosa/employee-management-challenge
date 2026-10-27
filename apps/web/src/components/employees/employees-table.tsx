'use client'

import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  calculateDailyWorkMinutes,
  calculateWorkedDays,
  formatDisplayDate,
  formatDuration,
  formatWorkedDays,
} from '@/lib/employees/calculations'
import type { Employee } from '@/lib/employees/types'

type SortDirection = 'asc' | 'desc'

/** Admissão e, no empate, ordem de cadastro — mesmo critério da API. */
export function sortByAdmission(
  employees: Employee[],
  direction: SortDirection,
) {
  const factor = direction === 'asc' ? 1 : -1
  return [...employees].sort(
    (a, b) =>
      factor *
      (a.admissionDate.localeCompare(b.admissionDate) ||
        a.createdAt.localeCompare(b.createdAt)),
  )
}

interface EmployeesTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

export function EmployeesTable({
  employees,
  onEdit,
  onDelete,
}: EmployeesTableProps) {
  const [direction, setDirection] = useState<SortDirection>('asc')
  const sorted = useMemo(
    () => sortByAdmission(employees, direction),
    [employees, direction],
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead
            aria-sort={direction === 'asc' ? 'ascending' : 'descending'}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-foreground"
              onClick={() =>
                setDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
              }
            >
              Admissão
              {direction === 'asc' ? (
                <ArrowUp className="size-3.5" />
              ) : (
                <ArrowDown className="size-3.5" />
              )}
            </button>
          </TableHead>
          <TableHead>Situação</TableHead>
          <TableHead>Expediente</TableHead>
          <TableHead>Horas/dia</TableHead>
          <TableHead>Dias trabalhados</TableHead>
          <TableHead>Fechamento</TableHead>
          <TableHead className="w-24 text-right">
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {sorted.map((employee) => {
          const minutes = calculateDailyWorkMinutes(
            employee.workStartTime,
            employee.workEndTime,
          )
          const days = calculateWorkedDays(
            employee.admissionDate,
            employee.dismissalDate,
          )

          return (
            <TableRow key={employee.id}>
              <TableCell className="whitespace-nowrap font-medium">
                {employee.name}
              </TableCell>
              <TableCell>{formatDisplayDate(employee.admissionDate)}</TableCell>
              <TableCell>
                {employee.dismissalDate ? (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    Desligado em {formatDisplayDate(employee.dismissalDate)}
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">
                    Ativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {employee.workStartTime} às {employee.workEndTime}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {minutes === null ? '—' : formatDuration(minutes)}
              </TableCell>
              <TableCell>
                {days === null ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  formatWorkedDays(days)
                )}
              </TableCell>
              <TableCell>{employee.closingPeriodicity}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${employee.name}`}
                    onClick={() => onEdit(employee)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    aria-label={`Excluir ${employee.name}`}
                    onClick={() => onDelete(employee)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
