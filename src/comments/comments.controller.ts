import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Request() req: any, @Body() body: { bugId: string; content: string; parentCommentId?: string }) {
    return this.commentsService.create({
      content: body.content,
      bugId: body.bugId,
      userId: req.user.userId,
      parentCommentId: body.parentCommentId
    });
  }
}
