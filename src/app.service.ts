import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'libs/entities/user.entity';
import { Repository } from 'typeorm';
import { addUserDto, deleteUserDto } from './app.dto';
import { DateTime, IANAZone } from 'luxon';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppHelperService } from 'libs/helper/app.helper';
import { EmailLog } from 'libs/entities/log.entity';

@Injectable()
export class AppService {
  constructor(private readonly appHelperService: AppHelperService) {}
  @InjectRepository(User)
  private readonly repository: Repository<User>;
  @InjectRepository(EmailLog)
  private readonly logRepository: Repository<EmailLog>;

  getHello(): string {
    return 'Hello World!';
  }

  public async addUser(body: addUserDto): Promise<string | never> {
    const { email, firstName, lastName, date, timezone }: addUserDto = body;

    let user = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new HttpException('Email already exist', HttpStatus.CONFLICT);
    }

    const time = new IANAZone(timezone);

    if (!time?.valid) {
      throw new HttpException(
        'Timezone not valid, use IANA timezone. example: Asia/Jakarta',
        HttpStatus.BAD_REQUEST,
      );
    }
    const dateTime = DateTime.fromISO(date, { zone: timezone }).set({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const utcDateTime = dateTime.toUTC();

    user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.date = utcDateTime.toString();
    user.timezone = timezone;
    await this.repository.save(user);
    return 'Sucessfully added';
  }

  public async deleteUser(body: deleteUserDto): Promise<string | never> {
    const { email }: deleteUserDto = body;

    const user = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    await this.repository.remove(user);
    return 'Sucessfully Deleted';
  }

  public async updateUser(body: addUserDto): Promise<string | never> {
    const { email, firstName, lastName, date, timezone }: addUserDto = body;

    const user = await this.repository.findOne({ where: { email } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const time = new IANAZone(timezone);

    if (!time?.valid) {
      throw new HttpException(
        'Timezone not valid, use IANA timezone. example: Asia/Jakarta',
        HttpStatus.BAD_REQUEST,
      );
    }
    const dateTime = DateTime.fromISO(date, { zone: timezone }).set({
      hour: 9,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const utcDateTime = dateTime.toUTC();

    if (utcDateTime.toString() != user.date) {
      user.version = user.version + 1;
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.date = utcDateTime.toString();
    user.timezone = timezone;

    await this.repository.save(user);
    return 'Sucessfully Updated';
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cronJob() {
    const users = await this.appHelperService.findUsers();

    users.forEach(async (user) => {
      const logs = await this.logRepository.find({
        where: {
          user: user,
        },
      });
      await this.appHelperService.sendBirthdayEmail(logs, user);
    });
    this.appHelperService.resendEmail();
  }
}
