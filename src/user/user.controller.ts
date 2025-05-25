import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser-dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //get all users
  @Get()
  async getallUsers() {
    return await this.userService.getAllUsers();
  }

  //   get user by id
  @Get('profile/:id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  // update user
  @Patch('update/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(id, updateUserDto);
  }
}
