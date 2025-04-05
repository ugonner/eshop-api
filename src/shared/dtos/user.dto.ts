import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { Gender } from "../enums/user.enum";
import { AuthDTO } from "./auth.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { DeliveryAddressDTO } from "./order.dto";
import { QueryRequestDTO } from "./query-request.dto";

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
    phoneNumber?: string;

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
    phoneNumber?: string;

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
    gender?: Gender;
    
    @ApiPropertyOptional()
    @Type(() => DeliveryAddressDTO)
    @ValidateNested()
    address?: DeliveryAddressDTO;
}

export class QueryUserDTO extends QueryRequestDTO {

}

export class SendUserMessagesDTO extends QueryUserDTO {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    channel?: "Email" | "SMS";

    @ApiProperty()
    @IsString()
    message: string;

    @ApiProperty()
    @IsString()
    subject: string;
}