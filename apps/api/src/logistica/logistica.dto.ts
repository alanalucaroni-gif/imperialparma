import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CalcularDistanciaDto {
  @IsString()
  @MinLength(5)
  origem!: string;

  @IsString()
  @MinLength(3)
  destino!: string;

  @IsOptional()
  @IsString()
  @IsIn(["TWO_WHEELER", "DRIVE"])
  modo?: "TWO_WHEELER" | "DRIVE";
}
