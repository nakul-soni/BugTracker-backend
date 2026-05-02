import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BugsModule } from './bugs/bugs.module';
import { ProjectsModule } from './projects/projects.module';
import { CommentsModule } from './comments/comments.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, BugsModule, ProjectsModule, CommentsModule, CloudinaryModule, AttachmentsModule, OrganizationsModule],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
