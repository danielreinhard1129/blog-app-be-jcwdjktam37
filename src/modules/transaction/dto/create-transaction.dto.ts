import { Type } from "class-transformer";
import { IsArray, IsInt, Min, ValidateNested } from "class-validator";

class TransactionItemDTO {
  @IsInt()
  @Min(1)
  ticketId!: number;

  @IsInt()
  @Min(1)
  qty!: number;
}

export class CreateTransactionDTO {
  @IsArray()
  @Type(() => TransactionItemDTO)
  @ValidateNested({ each: true })
  payload!: TransactionItemDTO[];
}
