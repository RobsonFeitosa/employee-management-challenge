import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Employee } from '@/lib/employees/types'

import { EmployeesTable, sortByAdmission } from './employees-table'

const employee = (overrides: Partial<Employee>): Employee => ({
  id: overrides.name ?? 'id',
  name: 'Fulano',
  admissionDate: '2024-01-01',
  dismissalDate: null,
  workStartTime: '08:00',
  workEndTime: '17:00',
  closingPeriodicity: 'Mensal',
  createdAt: '2024-06-01T00:00:00.000Z',
  updatedAt: '2024-06-01T00:00:00.000Z',
  ...overrides,
})

const employees = [
  employee({ name: 'Carla', admissionDate: '2023-05-10' }),
  employee({
    name: 'Ana',
    admissionDate: '2021-01-01',
    dismissalDate: '2021-01-31',
    workEndTime: '16:30',
  }),
  employee({ name: 'Bruno', admissionDate: '2022-07-15' }),
]

const rowNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent)

describe('sortByAdmission', () => {
  it('breaks ties by creation date', () => {
    const tied = [
      employee({ name: 'B', createdAt: '2024-06-02T00:00:00.000Z' }),
      employee({ name: 'A', createdAt: '2024-06-01T00:00:00.000Z' }),
    ]
    expect(sortByAdmission(tied, 'asc').map((e) => e.name)).toEqual(['A', 'B'])
  })
})

describe('EmployeesTable', () => {
  function setup() {
    const onEdit = jest.fn()
    const onDelete = jest.fn()
    render(
      <EmployeesTable
        employees={employees}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    )
    return { onEdit, onDelete, user: userEvent.setup() }
  }

  it('orders by admission date ascending by default and toggles', async () => {
    const { user } = setup()

    expect(rowNames()).toEqual(['Ana', 'Bruno', 'Carla'])

    await user.click(screen.getByRole('button', { name: /admissão/i }))
    expect(rowNames()).toEqual(['Carla', 'Bruno', 'Ana'])
  })

  it('shows worked days only for dismissed employees and daily hours for all', () => {
    setup()

    const ana = screen.getByRole('row', { name: /Ana/ })
    expect(ana).toHaveTextContent('Desligado em 31/01/2021')
    expect(ana).toHaveTextContent('30 dias')
    expect(ana).toHaveTextContent('8 horas e 30 minutos')

    const bruno = screen.getByRole('row', { name: /Bruno/ })
    expect(bruno).toHaveTextContent('Ativo')
    expect(bruno).not.toHaveTextContent(/dias/)
    expect(bruno).toHaveTextContent('9 horas')
  })

  it('triggers edit and delete for the right employee', async () => {
    const { user, onEdit, onDelete } = setup()

    await user.click(screen.getByRole('button', { name: 'Editar Bruno' }))
    await user.click(screen.getByRole('button', { name: 'Excluir Carla' }))

    expect(onEdit).toHaveBeenCalledWith(employees[2])
    expect(onDelete).toHaveBeenCalledWith(employees[0])
  })
})
