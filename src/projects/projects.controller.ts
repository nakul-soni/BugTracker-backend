import { Controller, Get, Post, Body, UseGuards, Request, Param, Query, Delete } from '@nestjs/common';
import { ProjectRoleGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Request() req: any, @Body() body: { name: string; organizationId: string }) {
    return this.projectsService.create(body, req.user.userId);
  }

  @Get()
  findAll(@Request() req: any, @Query('orgId') orgId?: string) {
    return this.projectsService.findAllForUser(req.user.userId, orgId);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  @UseGuards(ProjectRoleGuard)
  @Roles('MANAGER')
  addMember(@Param('id') id: string, @Body() body: { email: string; role: string }) {
    return this.projectsService.addMember(id, body.email, body.role);
  }

  @Delete(':id')
  @UseGuards(ProjectRoleGuard)
  @Roles('MANAGER')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(ProjectRoleGuard)
  @Roles('MANAGER')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.projectsService.removeMember(id, userId);
  }
}
