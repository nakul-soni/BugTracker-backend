import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BugsService } from './bugs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectRoleGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api/bugs')
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Post()
  create(@Request() req: any, @Body() createBugDto: any) {
    return this.bugsService.create({
      ...createBugDto,
      reportedBy: req.user.userId,
    });
  }

  @Get()
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.bugsService.findAll(req.user.userId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bugsService.findOne(id);
  }

  @UseGuards(ProjectRoleGuard)
  @Roles('MANAGER', 'DEVELOPER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBugDto: any, @Request() req: any) {
    return this.bugsService.update(id, updateBugDto, req.user.userId);
  }

  @Get(':id/activity')
  getActivity(@Param('id') id: string) {
    return this.bugsService.getActivity(id);
  }

  @UseGuards(ProjectRoleGuard)
  @Roles('MANAGER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bugsService.remove(id);
  }
}
