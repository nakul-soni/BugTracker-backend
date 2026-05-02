import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    let projectId = request.body.projectId || request.query.projectId;

    if (!projectId && request.params.id) {
      const bug = await this.prisma.bug.findUnique({ where: { id: request.params.id }});
      if (bug) {
        projectId = bug.projectId;
      } else {
        const project = await this.prisma.project.findUnique({ where: { id: request.params.id }});
        if (project) projectId = project.id;
      }
    }

    if (!projectId) return true;

    const member = await this.prisma.member.findFirst({
      where: { userId: user.userId, projectId }
    });

    if (!member) return false;

    return requiredRoles.includes(member.role);
  }
}
