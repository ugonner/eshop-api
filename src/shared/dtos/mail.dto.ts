import { IsEmail, IsOptional, IsString } from "class-validator";

export class MailDTO {
    @IsEmail({})
    to: string;

    @IsString()
    subject: string;
    
    @IsString()
    @IsOptional()
    message?: string;

    @IsString()
    @IsOptional()
    receiverName?: string;
    

    @IsOptional()
    entries?: {[key: string]: unknown}

    @IsString()
    @IsOptional()
    template?: string;
    
    @IsOptional()
    context?: Record<string, unknown>;
}