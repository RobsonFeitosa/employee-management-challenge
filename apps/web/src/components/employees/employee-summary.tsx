import {
  calculateDailyWorkMinutes,
  calculateWorkedDays,
  formatDisplayDate,
  formatDuration,
  formatWorkedDays,
} from '@/lib/employees/calculations'
import type { EmployeeInput } from '@/lib/employees/types'
import { cn } from '@/lib/utils'

interface SummaryRow {
  label: string
  value: string
}

function toRows(employee: EmployeeInput): SummaryRow[] {
  const minutes = calculateDailyWorkMinutes(
    employee.workStartTime,
    employee.workEndTime,
  )
  const days = calculateWorkedDays(
    employee.admissionDate,
    employee.dismissalDate,
  )

  const rows: SummaryRow[] = [
    { label: 'Nome', value: employee.name },
    {
      label: 'Admissão',
      value: formatDisplayDate(employee.admissionDate),
    },
    {
      label: 'Demissão',
      value: employee.dismissalDate
        ? formatDisplayDate(employee.dismissalDate)
        : 'Ativo (sem demissão)',
    },
    {
      label: 'Expediente',
      value: `${employee.workStartTime} às ${employee.workEndTime}`,
    },
    {
      label: 'Horas por dia',
      value: minutes === null ? '—' : formatDuration(minutes),
    },
  ]

  if (days !== null) {
    rows.push({ label: 'Dias trabalhados', value: formatWorkedDays(days) })
  }

  rows.push({ label: 'Fechamento', value: employee.closingPeriodicity })

  return rows
}

interface EmployeeSummaryProps {
  employee: EmployeeInput
  /** Na edição, destaca o que mudou em relação ao registro salvo. */
  previous?: EmployeeInput
}

export function EmployeeSummary({ employee, previous }: EmployeeSummaryProps) {
  const previousValues = new Map(
    previous ? toRows(previous).map((row) => [row.label, row.value]) : [],
  )

  return (
    <dl className="divide-y rounded-md border text-sm">
      {toRows(employee).map(({ label, value }) => {
        const before = previousValues.get(label)
        const changed = previous !== undefined && before !== value

        return (
          <div
            key={label}
            className={cn(
              'grid grid-cols-[9rem_1fr] gap-2 px-3 py-2',
              changed && 'bg-amber-50',
            )}
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">
              {changed && before && (
                <span className="mr-2 font-normal text-muted-foreground line-through">
                  {before}
                </span>
              )}
              {value}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
