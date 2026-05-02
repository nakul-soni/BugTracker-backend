import { Controller, Get, Post, Body, UseGuards, Request, Param, Delete } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Request() req: any, @Body() body: { name: string }) {
    return this.organizationsService.create({ name: body.name, ownerId: req.user.userId });
  }

  @Get()
  findAll(@Request() req: any) {
    return this.organizationsService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.organizationsService.remove(id, req.user.userId);
  }
}
