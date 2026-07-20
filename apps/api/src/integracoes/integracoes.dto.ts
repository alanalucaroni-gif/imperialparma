import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class SalvarCredencialDto {
  @IsOptional() @IsString() identificador?: string;
  @IsString() @MinLength(8) token!: string;
}

export class SalvarWhatsappMetaDto {
  @IsString() @MinLength(5) phoneNumberId!: string;
  @IsString() @Matches(/^v\d+\.\d+$/) graphVersion!: string;
  @IsString() @MinLength(3) templateName!: string;
  @IsString() @MinLength(2) templateLanguage!: string;
  @IsOptional() @IsString() @MinLength(20) accessToken?: string;
  @IsOptional() @IsString() @MinLength(8) verifyToken?: string;
  @IsOptional() @IsString() @MinLength(8) appSecret?: string;
}
