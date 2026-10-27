import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator'

import { DATE_PATTERN, NAME_PATTERN, TIME_PATTERN } from '../employee.constants'
import { ClosingPeriodicity } from '../enums/closing-periodicity.enum'
import { IsNotBefore } from '../validators/is-not-before.validator'

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value

export class CreateEmployeeDto {
  @Transform(trim)
  @IsString({ message: 'O nome é obrigatório' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @Matches(NAME_PATTERN, { message: 'O nome não pode conter números' })
  name: string

  @Matches(DATE_PATTERN, {
    message: 'A data de admissão deve estar no formato YYYY-MM-DD',
  })
  @IsISO8601({ strict: true }, { message: 'Data de admissão inválida' })
  admissionDate: string

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @Matches(DATE_PATTERN, {
    message: 'A data de demissão deve estar no formato YYYY-MM-DD',
  })
  @IsISO8601({ strict: true }, { message: 'Data de demissão inválida' })
  @IsNotBefore('admissionDate', DATE_PATTERN, {
    message: 'A data de demissão não pode ser anterior à data de admissão',
  })
  dismissalDate?: string | null

  @Matches(TIME_PATTERN, {
    message: 'O início do expediente deve estar no formato HH:mm',
  })
  workStartTime: string

  @Matches(TIME_PATTERN, {
    message: 'O fim do expediente deve estar no formato HH:mm',
  })
  @IsNotBefore('workStartTime', TIME_PATTERN, {
    message: 'O fim do expediente não pode ser anterior ao início',
  })
  workEndTime: string

  @IsEnum(ClosingPeriodicity, {
    message: `A periodicidade deve ser uma de: ${Object.values(ClosingPeriodicity).join(', ')}`,
  })
  closingPeriodicity: ClosingPeriodicity
}
