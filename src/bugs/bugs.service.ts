import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BugsService {
  constructor(private prisma: PrismaService, private eventsGateway: EventsGateway) {}

  async findAll(userId: string, projectId?: string) {
    const where: any = {
      project: { members: { some: { userId } } }
    };
    if (projectId) where.projectId = projectId;
    return this.prisma.bug.findMany({
      where,
      include: { reporter: true, assignee: true, project: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.bug.findUnique({
      where: { id },
      include: { 
        reporter: true, 
        assignee: true, 
        project: true,
        attachments: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        }
      },
    });
  }

  async create(data: any) {
    return this.prisma.bug.create({
      data,
    });
  }

  async update(id: string, data: any, userId: string) {
    const oldBug = await this.prisma.bug.findUnique({ where: { id } });
    if (!oldBug) throw new Error("Bug not found");

    const bug = await this.prisma.bug.update({
      where: { id },
      data,
    });

    const changes = [];
    if (data.status && data.status !== oldBug.status) changes.push({ field: 'status', old: oldBug.status, new: data.status });
    if (data.severity && data.severity !== oldBug.severity) changes.push({ field: 'severity', old: oldBug.severity, new: data.severity });
    if (data.priority && data.priority !== oldBug.priority) changes.push({ field: 'priority', old: oldBug.priority, new: data.priority });
    if ('assignedTo' in data && data.assignedTo !== oldBug.assignedTo) changes.push({ field: 'assignedTo', old: oldBug.assignedTo, new: data.assignedTo });

    if (changes.length > 0) {
      await this.prisma.activityLog.create({
        data: {
          entityType: 'BUG',
          action: 'UPDATED',
          metadata: { bugId: id, userId, changes },
        }
      });
    }

    this.eventsGateway.emitBugUpdate(id);
    return bug;
  }

  async getActivity(bugId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: { entityType: 'BUG' },
      orderBy: { createdAt: 'desc' }
    });

    const bugLogs = logs.filter(l => (l.metadata as any)?.bugId === bugId);

    const userIds = [...new Set(bugLogs.map(log => (log.metadata as any)?.userId).filter(Boolean))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: { id: true, name: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.name]));
    
    const assigneeIds = [...new Set(bugLogs.flatMap(log => {
      const changes = (log.metadata as any)?.changes || [];
      const assigneeChange = changes.find((c: any) => c.field === 'assignedTo');
      if (assigneeChange) return [assigneeChange.old, assigneeChange.new];
      return [];
    }).filter(Boolean))];
    
    const assignees = await this.prisma.user.findMany({
      where: { id: { in: assigneeIds as string[] } },
      select: { id: true, name: true }
    });
    const assigneeMap = new Map(assignees.map(u => [u.id, u.name]));

    return bugLogs.map(log => {
      const metadata: any = log.metadata || {};
      return {
        ...log,
        userName: userMap.get(metadata.userId) || 'System',
        metadata: {
          ...metadata,
          changes: (metadata.changes || []).map((c: any) => {
            if (c.field === 'assignedTo') {
              return { ...c, oldName: c.old ? assigneeMap.get(c.old) : 'Unassigned', newName: c.new ? assigneeMap.get(c.new) : 'Unassigned' };
            }
            return c;
          })
        }
      };
    });
  }

  async remove(id: string) {
    return this.prisma.bug.delete({
      where: { id },
    });
  }
}
