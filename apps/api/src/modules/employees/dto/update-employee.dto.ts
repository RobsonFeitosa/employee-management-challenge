import { CreateEmployeeDto } from './create-employee.dto'

/**
 * Edição substitui o registro inteiro (PUT): as regras entre campos
 * (demissão x admissão, fim x início) sempre têm os dois lados no payload.
 */
export class UpdateEmployeeDto extends CreateEmployeeDto {}
