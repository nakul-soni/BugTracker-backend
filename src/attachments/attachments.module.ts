import { Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [CloudinaryModule, PrismaModule],
  controllers: [AttachmentsController],
})
export class AttachmentsModule {}
