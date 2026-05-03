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

    await this.prisma.activityLog.create({
      data: {
        entityType: 'BUG',
        action: 'COMMENTED',
        metadata: { bugId: data.bugId, userId: data.userId, commentId: comment.id },
      }
    });

    this.eventsGateway.emitCommentAdded(data.bugId);
    return comment;
  }
}
