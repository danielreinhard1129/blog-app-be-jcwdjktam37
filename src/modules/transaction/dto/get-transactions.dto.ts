import { IsEnum, IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";
import { TransactionStatus } from "../../../generated/prisma";

export class GetTransactionsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search: string = "";

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;
}
