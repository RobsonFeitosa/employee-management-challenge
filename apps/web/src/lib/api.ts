import type { Employee, EmployeeInput } from './employees/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly messages: string[],
  ) {
    super(messages.join('\n'))
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.message ?? 'Erro inesperado ao comunicar com a API'
    throw new ApiError(
      response.status,
      Array.isArray(message) ? message : [message],
    )
  }

  return (response.status === 204 ? undefined : await response.json()) as T
}

export const employeesApi = {
  list: () => request<Employee[]>('/employees'),
  create: (data: EmployeeInput) =>
    request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: EmployeeInput) =>
    request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<void>(`/employees/${id}`, { method: 'DELETE' }),
}

/** Texto amigável para toasts: mensagens da API ou falha de rede. */
export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.messages.join(' • ')
  return 'Não foi possível conectar à API. Verifique se ela está em execução.'
}
