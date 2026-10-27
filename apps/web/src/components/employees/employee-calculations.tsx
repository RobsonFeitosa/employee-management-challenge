'use client'

import { CalendarDays, Clock } from 'lucide-react'
import { type Control, useWatch } from 'react-hook-form'

import {
  calculateDailyWorkMinutes,
  calculateWorkedDays,
  formatDuration,
  formatWorkedDays,
} from '@/lib/employees/calculations'
import type { EmployeeFormInput } from '@/lib/employees/schema'

/** Cálculos ao vivo enquanto o formulário é preenchido. */
export function EmployeeCalculations({
  control,
}: {
  control: Control<EmployeeFormInput>
}) {
  const [admissionDate, dismissalDate, workStartTime, workEndTime] = useWatch({
    control,
    name: ['admissionDate', 'dismissalDate', 'workStartTime', 'workEndTime'],
  })

  const minutes = calculateDailyWorkMinutes(workStartTime, workEndTime)
  const days = calculateWorkedDays(admissionDate, dismissalDate)

  return (
    <div
      className="grid gap-3 rounded-md border bg-muted/50 p-3 text-sm sm:grid-cols-2"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <span className="text-muted-foreground">Horas por dia:</span>
        <strong data-testid="daily-hours">
          {minutes === null ? '—' : formatDuration(minutes)}
        </strong>
      </div>

      {days !== null && (
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">Dias trabalhados:</span>
          <strong data-testid="worked-days">{formatWorkedDays(days)}</strong>
        </div>
      )}
    </div>
  )
}
