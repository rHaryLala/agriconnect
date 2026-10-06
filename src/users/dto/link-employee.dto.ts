import { IsUUID } from "class-validator";

export class LinkEmployeeDto {
    @IsUUID()
    employeeId: string;
}