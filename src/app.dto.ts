import { IsDateString, IsString } from 'class-validator';

export class addUserDto {
  @IsString()
  public readonly email: string;

  @IsString()
  public readonly firstName: string;

  @IsString()
  public readonly lastName: string;

  @IsDateString()
  public readonly date: Date;

  @IsString()
  public readonly timezone: string;
}

export class deleteUserDto {
  @IsString()
  public readonly email: string;
}
