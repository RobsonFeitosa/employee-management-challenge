import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { EmployeesService } from './employees.service'
import { Employee, EmployeeSchema } from './schemas/employee.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
