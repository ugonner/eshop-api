import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class categoryDTO {
    
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    id?: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    imageUrl?: string;
}