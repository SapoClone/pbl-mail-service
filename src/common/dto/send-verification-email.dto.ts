import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
