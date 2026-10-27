import { render, screen } from '@testing-library/react'

import { useEmployees } from '@/hooks/use-employees'

import { EmployeesPage } from './employees-page'

jest.mock('@/hooks/use-employees', () => ({
  useEmployees: jest.fn(),
  useSaveEmployee: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteEmployee: () => ({ mutate: jest.fn(), isPending: false }),
}))

const mockUseEmployees = useEmployees as jest.Mock

describe('EmployeesPage', () => {
  it('shows a friendly empty state when there are no employees', () => {
    mockUseEmployees.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    })

    render(<EmployeesPage />)

    expect(
      screen.getByText('Nenhum funcionário cadastrado'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /cadastrar funcionário/i }),
    ).toBeInTheDocument()
  })

  it('shows an error state with retry when the API fails', () => {
    mockUseEmployees.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      error: new TypeError('Failed to fetch'),
      refetch: jest.fn(),
    })

    render(<EmployeesPage />)

    expect(
      screen.getByText('Não foi possível carregar a lista'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument()
  })
})
