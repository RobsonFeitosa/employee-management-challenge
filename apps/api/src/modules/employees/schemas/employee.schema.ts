import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

import {
  formatCalendarDate,
  NAME_PATTERN,
  TIME_PATTERN,
  timeToMinutes,
} from '../employee.constants'
import { ClosingPeriodicity } from '../enums/closing-periodicity.enum'

@Schema({
  collection: 'employees',
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id)
      delete ret._id
      ret.admissionDate = formatCalendarDate(ret.admissionDate as Date)
      ret.dismissalDate = ret.dismissalDate
        ? formatCalendarDate(ret.dismissalDate as Date)
        : null
      return ret
    },
  },
})
export class Employee {
  @Prop({ required: true, trim: true, match: NAME_PATTERN })
  name: string

  /** Datas guardadas à meia-noite UTC: só o dia importa. */
  @Prop({ required: true, index: true })
  admissionDate: Date

  @Prop({ type: Date, default: null })
  dismissalDate: Date | null

  @Prop({ required: true, match: TIME_PATTERN })
  workStartTime: string

  @Prop({ required: true, match: TIME_PATTERN })
  workEndTime: string

  @Prop({ required: true, enum: Object.values(ClosingPeriodicity) })
  closingPeriodicity: ClosingPeriodicity
}

export type EmployeeDocument = HydratedDocument<Employee>

export const EmployeeSchema = SchemaFactory.createForClass(Employee)

// Regras que cruzam campos: última barreira caso algo escape dos DTOs.
EmployeeSchema.pre('validate', function (next) {
  if (
    this.dismissalDate &&
    this.admissionDate &&
    this.dismissalDate < this.admissionDate
  ) {
    this.invalidate(
      'dismissalDate',
      'A data de demissão não pode ser anterior à data de admissão',
    )
  }

  if (
    TIME_PATTERN.test(this.workStartTime ?? '') &&
    TIME_PATTERN.test(this.workEndTime ?? '') &&
    timeToMinutes(this.workEndTime) < timeToMinutes(this.workStartTime)
  ) {
    this.invalidate(
      'workEndTime',
      'O fim do expediente não pode ser anterior ao início',
    )
  }

  next()
})
