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
    
    async sendEmail(emails: string[], dto: MailDTO){
        (new Logger("SendMail").log(emails, dto))
        const {subject, receiverName, message, entries, template} = dto;

        Promise.allSettled(
            emails.map((email) => 
                this.mailService.sendEmail({
                    to: email,
                    subject,
                    template: template ? template : "./generals/general.hbs",
                    context: {
                      name: receiverName || email,
                      message,
                      entries
                    }
                  })
            )
        ).then((res) => {
            res.forEach((resValue) => {
                if(resValue.status === "rejected") console.log(`Error sending email: ${dto.message}`, resValue.reason);
                else console.log(`${dto.message.substring(0, 40)} email sent successfully`)
                })
        })
          
    }
}
