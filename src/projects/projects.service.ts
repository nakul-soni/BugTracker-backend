import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; organizationId: string }, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: data.organizationId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== userId) throw new ForbiddenException('Only the organization owner can create projects');

    return this.prisma.project.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        members: {
          create: { userId, role: 'MANAGER' }
        }
      }
    });
  }

  async findAllForUser(userId: string, orgId?: string) {
    const where: any = { members: { some: { userId } } };
    if (orgId) where.organizationId = orgId;
    return this.prisma.project.findMany({ 
      where,
      include: {
        members: { where: { userId } },
        organization: true
      }
    });
  }

  async getMembers(projectId: string) {
    return this.prisma.member.findMany({
      where: { projectId },
      include: { user: true }
    });
  }

  async addMember(projectId: string, email: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No user found with that email address. They must register first!');
    
    const existingMember = await this.prisma.member.findFirst({
      where: { projectId, userId: user.id }
    });
    if (existingMember) throw new ConflictException('User is already a member of this project!');

    return this.prisma.member.create({
      data: { projectId, userId: user.id, role: role as any }
    });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }

  async removeMember(projectId: string, userId: string) {
    return this.prisma.member.delete({
      where: { userId_projectId: { userId, projectId } }
    });
  }
}
