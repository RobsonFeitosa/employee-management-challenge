import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common'

import { CreateEmployeeDto } from './dto/create-employee.dto'
import { UpdateEmployeeDto } from './dto/update-employee.dto'
import { EmployeesService } from './employees.service'
import { EmployeeResponse } from './interfaces/employee-response.interface'
import { EmployeeDocument } from './schemas/employee.schema'

const toResponse = (employee: EmployeeDocument) =>
  employee.toJSON() as unknown as EmployeeResponse

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(): Promise<EmployeeResponse[]> {
    const employees = await this.employeesService.findAll()
    return employees.map(toResponse)
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EmployeeResponse> {
    return toResponse(await this.employeesService.findOne(id))
  }

  @Post()
  async create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    return toResponse(await this.employeesService.create(dto))
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponse> {
    return toResponse(await this.employeesService.update(id, dto))
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.employeesService.remove(id)
  }
}
