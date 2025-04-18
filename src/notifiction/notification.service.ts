import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { MailDTO } from '../shared/dtos/mail.dto';

@Injectable()
export class NotificationService {

    constructor(
        private mailService: MailService
    ){}
    
    async sendEmailWithIDs(userIds: string[], dto: MailDTO){
        (new Logger("sendEmailWithIds")).log(userIds, dto)    
    }
    
    async sendEmail(dto: MailDTO){

        const {to, subject, context, template} = dto;

        this.mailService.sendEmail({
            to,
            subject,
            template: template ? template : "./generals/general.hbs",
            context
          })
          .catch((err) => console.error(`Error sending email on ${context?.message}`, err.message))
          
    }
}
