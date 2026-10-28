'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type EmployeeFormInput,
  employeeFormSchema,
  type EmployeeFormValues,
  emptyEmployeeForm,
  NAME_DIGITS_MESSAGE,
  stripDigits,
} from '@/lib/employees/schema'
import { CLOSING_PERIODICITIES } from '@/lib/employees/types'

import { EmployeeCalculations } from './employee-calculations'

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden>
      *
    </span>
  )
}

interface EmployeeFormProps {
  id: string
  defaultValues?: EmployeeFormInput
  onSubmit: (values: EmployeeFormValues) => void
  /** Renderizado ao fim do form (ex.: botões do rodapé do modal). */
  footer?: ReactNode
}

export function EmployeeForm({
  id,
  defaultValues = emptyEmployeeForm,
  onSubmit,
  footer,
}: EmployeeFormProps) {
  const form = useForm<EmployeeFormInput, unknown, EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    // Valida a cada alteração e ao sair do campo: os erros aparecem na hora.
    mode: 'all',
  })
  const [blockedDigit, setBlockedDigit] = useState(false)
  const [admissionDate, workStartTime] = form.watch([
    'admissionDate',
    'workStartTime',
  ])

  // Regras cruzadas: ao mudar um lado, revalida o outro se ele já tem valor.
  const revalidate = (field: keyof EmployeeFormInput) => {
    if (form.getValues(field)) form.trigger(field)
  }

  return (
    <Form {...form}>
      <form
        id={id}
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nome <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex.: Maria da Silva"
                  {...field}
                  onChange={(event) => {
                    // Números são bloqueados na digitação/colagem e o motivo aparece na hora.
                    const typed = event.target.value
                    const clean = stripDigits(typed)
                    setBlockedDigit(clean !== typed)
                    field.onChange(clean)
                  }}
                />
              </FormControl>
              {blockedDigit && !form.formState.errors.name ? (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {NAME_DIGITS_MESSAGE}
                </p>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Data de admissão <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      revalidate('dismissalDate')
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dismissalDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Data de demissão{' '}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={admissionDate || undefined}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Deixe vazio se estiver ativo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workStartTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Início do expediente <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event)
                      revalidate('workEndTime')
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workEndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fim do expediente <RequiredMark />
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    min={workStartTime || undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="closingPeriodicity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Periodicidade do fechamento <RequiredMark />
              </FormLabel>
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                onOpenChange={(open) => !open && field.onBlur()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLOSING_PERIODICITIES.map((periodicity) => (
                    <SelectItem key={periodicity} value={periodicity}>
                      {periodicity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <EmployeeCalculations control={form.control} />

        {footer}
      </form>
    </Form>
  )
}
