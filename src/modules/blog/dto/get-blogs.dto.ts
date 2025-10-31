import { IsOptional, IsString } from "class-validator";
import { PaginationQueryParams } from "../../pagination/dto/pagination.dto";

export class GetBlogsDTO extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  search: string = "";
}
