import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ConfigSchema {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsNumber()
  @IsOptional()
  APP_PORT: number = 3000;

  @IsString()
  CORS_ORIGIN: string;
}