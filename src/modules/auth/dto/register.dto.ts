import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
