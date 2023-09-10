import { Body, Controller, Get, Post, Delete, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { addUserDto, deleteUserDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/user')
  private async addUser(@Body() body: addUserDto): Promise<string> {
    return this.appService.addUser(body);
  }

  @Delete('/user')
  private async deleteUser(@Body() body: deleteUserDto): Promise<string> {
    return this.appService.deleteUser(body);
  }

  @Put('/user')
  private async updateUser(@Body() body: addUserDto): Promise<string> {
    return this.appService.updateUser(body);
  }
}
