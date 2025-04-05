import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString } from "class-validator";

export class QueryDateDTO {
    
    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    startDate?: string;
    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    endDate?: string;

    
    @ApiPropertyOptional()
    @IsDateString()
    @IsOptional()
    dDate?: string;

}

export class QueryRequestDTO extends QueryDateDTO{
    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    page?: string;
    @ApiPropertyOptional()
    @IsNumberString()
    @IsOptional()
    limit?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    searchTerm?: string;

    @ApiPropertyOptional()
    @IsEnum(["ASC", "DESC"], {message: `order must be one of "ASC" | "DESC"`})
    @IsOptional()
    order?: "ASC" | "DESC";
}
