import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from 'libs/entities/user.entity';
import config from '../typeorm.config';
import { AppHelperService } from 'libs/helper/app.helper';
import { EmailLog } from 'libs/entities/log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([EmailLog]),
  ],
  controllers: [AppController],
  providers: [AppService, AppHelperService],
})
export class AppModule {}
