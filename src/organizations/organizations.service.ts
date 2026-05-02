import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; ownerId: string }) {
    return this.prisma.organization.create({ data });
  }

  async findAllForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { projects: { some: { members: { some: { userId } } } } }
        ]
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async remove(id: string, userId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== userId) throw new ForbiddenException('Only the owner can delete the organization');
    
    return this.prisma.organization.delete({ where: { id } });
  }
}
