import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmployeeForm } from './employee-form'

const filled = {
  name: 'Maria da Silva',
  admissionDate: '2024-01-01',
  dismissalDate: '',
  workStartTime: '08:00',
  workEndTime: '16:30',
  closingPeriodicity: 'Mensal' as const,
}

function setup(defaultValues = filled) {
  const onSubmit = jest.fn()
  render(
    <EmployeeForm
      id="test-form"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      footer={<button type="submit">Salvar</button>}
    />,
  )
  return { onSubmit, user: userEvent.setup() }
}

describe('EmployeeForm', () => {
  it('shows daily hours and hides worked days while there is no dismissal', () => {
    setup()

    expect(screen.getByTestId('daily-hours')).toHaveTextContent(
      '8 horas e 30 minutos',
    )
    expect(screen.queryByTestId('worked-days')).not.toBeInTheDocument()
  })

  it('updates worked days in real time when dismissal is filled', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText(/data de demissão/i), '2024-01-31')

    expect(screen.getByTestId('worked-days')).toHaveTextContent('30 dias')
  })

  it('blocks digits in the name while typing and explains why', async () => {
    const { user } = setup()
    const name = screen.getByLabelText(/^nome/i)

    await user.clear(name)
    await user.type(name, 'Maria 2')

    expect(name).toHaveValue('Maria ')
    expect(
      screen.getByText('O nome não pode conter números'),
    ).toBeInTheDocument()

    await user.type(name, 'Silva')
    expect(name).toHaveValue('Maria Silva')
    expect(
      screen.queryByText('O nome não pode conter números'),
    ).not.toBeInTheDocument()
  })

  it('strips digits from pasted names', async () => {
    const { user } = setup()
    const name = screen.getByLabelText(/^nome/i)

    await user.clear(name)
    await user.click(name)
    await user.paste('João 3º')

    expect(name).toHaveValue('João º')
  })

  it('shows cross-field errors immediately, without submitting', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText(/data de demissão/i), '2023-12-31')
    expect(
      screen.getByText(
        'A data de demissão não pode ser anterior à data de admissão',
      ),
    ).toBeInTheDocument()

    const end = screen.getByLabelText(/fim do expediente/i)
    await user.clear(end)
    await user.type(end, '07:00')
    expect(
      screen.getByText('O fim do expediente não pode ser anterior ao início'),
    ).toBeInTheDocument()
  })

  it('revalidates the other side when admission or start changes', async () => {
    const { user } = setup()

    await user.type(screen.getByLabelText(/data de demissão/i), '2024-01-31')
    const admission = screen.getByLabelText(/data de admissão/i)
    await user.clear(admission)
    await user.type(admission, '2024-02-15')

    expect(
      screen.getByText(
        'A data de demissão não pode ser anterior à data de admissão',
      ),
    ).toBeInTheDocument()
  })

  it('limits the pickers to valid ranges', () => {
    setup()

    expect(screen.getByLabelText(/data de demissão/i)).toHaveAttribute(
      'min',
      '2024-01-01',
    )
    expect(screen.getByLabelText(/fim do expediente/i)).toHaveAttribute(
      'min',
      '08:00',
    )
  })

  it('shows the required message as soon as a required field is cleared', async () => {
    const { user } = setup()

    await user.clear(screen.getByLabelText(/^nome/i))

    expect(screen.getByText('O nome é obrigatório')).toBeInTheDocument()
  })

  it('shows inline errors and does not submit invalid data', async () => {
    const { user, onSubmit } = setup()

    await user.clear(screen.getByLabelText(/^nome/i))
    await user.type(screen.getByLabelText(/^nome/i), 'Maria@')
    await user.clear(screen.getByLabelText(/fim do expediente/i))
    await user.type(screen.getByLabelText(/fim do expediente/i), '07:00')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('O nome deve conter apenas letras'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('O fim do expediente não pode ser anterior ao início'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits parsed values when everything is valid', async () => {
    const { user, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(onSubmit).toHaveBeenCalledWith(filled, expect.anything())
  })
})
