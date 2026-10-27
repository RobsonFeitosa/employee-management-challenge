'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
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
} from '@/lib/employees/schema'
import { CLOSING_PERIODICITIES } from '@/lib/employees/types'

import { EmployeeCalculations } from './employee-calculations'

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
    mode: 'onTouched',
  })

  // Regras cruzadas: ao mudar um lado, revalida o outro se ele já foi tocado.
  const revalidate = (field: keyof EmployeeFormInput) => {
    if (form.formState.touchedFields[field]) form.trigger(field)
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Maria da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de admissão</FormLabel>
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
                  <Input type="date" {...field} />
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
                <FormLabel>Início do expediente</FormLabel>
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
                <FormLabel>Fim do expediente</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
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
              <FormLabel>Periodicidade do fechamento</FormLabel>
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
