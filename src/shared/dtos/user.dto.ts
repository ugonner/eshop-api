import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Gender } from "../enums/user.enum";
import { AuthDTO } from "./auth.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { DeliveryAddressDTO } from "./order.dto";

export class UserProfileDTO extends AuthDTO{
    

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiPropertyOptional()
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender

    @ApiPropertyOptional()
    @Type(() => DeliveryAddressDTO)
    @ValidateNested()
    address?: DeliveryAddressDTO;

}

export class UpdateProfileDTO {
    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiPropertyOptional()
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender
}