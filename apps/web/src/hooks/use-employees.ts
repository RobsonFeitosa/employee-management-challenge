import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { employeesApi } from '@/lib/api'
import type { EmployeeInput } from '@/lib/employees/types'

export const employeesQueryKey = ['employees']

export function useEmployees() {
  return useQuery({ queryKey: employeesQueryKey, queryFn: employeesApi.list })
}

/** Cria quando não há `id`; caso contrário, edita. */
export function useSaveEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: EmployeeInput }) =>
      id ? employeesApi.update(id, data) : employeesApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: employeesQueryKey }),
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: employeesApi.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: employeesQueryKey }),
  })
}
