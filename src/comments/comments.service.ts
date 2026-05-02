import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService, private eventsGateway: EventsGateway) {}

  async create(data: any) {
    const comment = await this.prisma.comment.create({
      data,
      include: { user: true }
    });
    this.eventsGateway.emitCommentAdded(data.bugId);
    return comment;
  }
}
