import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

import * as toStream from 'buffer-to-stream';
import { UploadApiResponse, v2 } from 'cloudinary';
import { IAttachment } from '../shared/interfaces/typings';

@Injectable()
export class FileUploadService {
  private awsS3Bucket = process.env.AWS_BUCKET || 'ugonnatalk';

  async uploadMessageAttachmentToLocal(file: Express.Multer.File): Promise<IAttachment> {
    console.log("file name", file.originalname);
    //const fileExtension = file.originalname.split(".")[-1];
     

    const attachmentUrl = `/products/${Date.now()}.${file.originalname.replace(" ", "_")}`;
    const filePath = path.join(__dirname, '..', '..', 'public', attachmentUrl);
    fs.writeFileSync(filePath, file.buffer);
    await new Promise((resolve, reject) => {
      fs.writeFile(filePath, file.buffer, (err) => {
        if (err) reject(err);
        resolve(attachmentUrl);
      });
    });
    const attachmentData: IAttachment = {
      attachmentUrl: `${process.env.BASE_URL}${attachmentUrl}`,
      attachmentType: file.mimetype as any,
    };
    return attachmentData;
  }

  async uploadMessageAttachmentToCloudinary(file: Express.Multer.File): Promise<IAttachment> {
    
    const cloudinaryApiKey =
      process.env.NODE_ENV === 'production'
        ? process.env.CLOUDINARY_API_KEY
        : process.env.CLOUDINARY_API_KEY;
    const cloudinaryApiKeySecret =
      process.env.NODE_ENV === 'production'
        ? process.env.CLOUDINARY_API_SECRET
        : process.env.CLOUDINARY_API_SECRET;

    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const awsRegion = process.env.AWS_REGION || 'eu-north-1';
    const cloudinaryV2 = v2;
    cloudinaryV2.config({
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiKeySecret,
      cloud_name: cloudinaryCloudName
    });
    

    const fileStream = toStream(file.buffer);
    const attachmentType = /video/i.test(file.mimetype) ? 'video' : 'audio';
    const fileExtension = file.originalname.replace(" ", "_");
    const key = `${Date.now()}-${attachmentType}.${fileExtension}`;

    const uploadStreamPromise: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream({
        resource_type: "auto"
      }, (err, result) => {
        if(err) reject(err);
        resolve(result)
      });
      fileStream.pipe(uploadStream);
    });
    return {
      attachmentType,
      attachmentUrl: uploadStreamPromise.secure_url
    }

    

    const attachmentUrl = `https://${this.awsS3Bucket}.s3.${awsRegion}.amazonaws.com/${key}`;
    return {
      attachmentType: file.mimetype as any,
      attachmentUrl,
    };
  }

  async deleteFileLocal(fileUrl: string) {
    const filePath = fileUrl.replace(`${process.env.BASE_URL}`, "");
    const fullPath = path.join(__dirname, '..', '..', 'public', filePath);
    const fileExists = fs.existsSync(fullPath);
    if(!fileExists) return;
    fs.unlink(fullPath, (err) => {
      if(err) {
        console.log("Error deleting file", err.message);
        return;
      };
    })
  }
  
}
