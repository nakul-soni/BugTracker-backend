import { Controller, Post, Body, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/attachments')
export class AttachmentsController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Request() req: any, @UploadedFile() file: Express.Multer.File, @Body('bugId') bugId: string) {
    const result = await this.cloudinaryService.uploadFile(file);
    
    return this.prisma.attachment.create({
      data: {
        fileUrl: result.secure_url,
        bugId,
        fileType: file.mimetype,
      }
    });
  }
}
