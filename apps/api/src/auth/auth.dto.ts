import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @IsString() @MinLength(3) email!: string;
  @IsString() @MinLength(8) senha!: string;
}

export class RefreshDto {
  @IsString() refreshToken!: string;
}
