import { IsNotEmpty, IsUUID } from "class-validator";

export class UploadPaymentProofDTO {
  @IsNotEmpty()
  @IsUUID()
  uuid!: string;
}
