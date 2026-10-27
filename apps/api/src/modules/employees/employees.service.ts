import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Error as MongooseError, isValidObjectId, Model } from 'mongoose'

import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { parseCalendarDate } from './employee.constants'
import { Employee, EmployeeDocument } from './schemas/employee.schema'

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name)
    private readonly employeeModel: Model<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeDocument> {
    const EmployeeModel = this.employeeModel
    return this.persist(new EmployeeModel(this.toModel(dto)))
  }

  /** Mais antigo primeiro; empate na admissão cai na ordem de cadastro. */
  async findAll(): Promise<EmployeeDocument[]> {
    return this.employeeModel
      .find()
      .sort({ admissionDate: 1, createdAt: 1 })
      .exec()
  }

  async findOne(id: string): Promise<EmployeeDocument> {
    const employee = isValidObjectId(id)
      ? await this.employeeModel.findById(id).exec()
      : null

    if (!employee) {
      throw new NotFoundException('Funcionário não encontrado')
    }

    return employee
  }

  /** Carrega e salva o documento para que o hook `pre('validate')` rode na edição. */
  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeDocument> {
    const employee = await this.findOne(id)
    employee.set(this.toModel(dto))
    return this.persist(employee)
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id)
    await employee.deleteOne()
  }

  private toModel(dto: CreateEmployeeDto): Employee {
    return {
      name: dto.name,
      admissionDate: parseCalendarDate(dto.admissionDate),
      dismissalDate: dto.dismissalDate
        ? parseCalendarDate(dto.dismissalDate)
        : null,
      workStartTime: dto.workStartTime,
      workEndTime: dto.workEndTime,
      closingPeriodicity: dto.closingPeriodicity,
    }
  }

  private async persist(employee: EmployeeDocument): Promise<EmployeeDocument> {
    try {
      return await employee.save()
    } catch (error) {
      if (error instanceof MongooseError.ValidationError) {
        throw new BadRequestException(
          Object.values(error.errors).map((e) => e.message),
        )
      }
      throw error
    }
  }
}
