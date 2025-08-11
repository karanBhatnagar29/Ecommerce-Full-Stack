import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles-guards';
import { Roles } from 'src/auth/roles-decorator';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Public signup
  @Post('signup')
  signup(@Body() body: { email: string; password: string; role: string }) {
    return this.adminService.signup(body);
  }

  // Public login
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body);
  }

  // Protected routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('dashboard')
  getDashboardData() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @Get('orders')
  getAllOrders() {
    return this.adminService.getAllOrders();
  }
}
