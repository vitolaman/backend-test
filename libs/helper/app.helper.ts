// app/app.helper.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { EmailLog } from 'libs/entities/log.entity';
import { User } from 'libs/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppHelperService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailLog)
    private readonly logRepository: Repository<EmailLog>,
  ) {}

  async findUsers(): Promise<User[]> {
    const now = new Date(); // Get the current UTC date and time
    const day = now.getUTCDate(); // Get the current day (1-31) in UTC
    const month = now.getUTCMonth() + 1; // Get the current month (0-11) in UTC, so add 1 to make it 1-12
    const hour = now.getUTCHours(); // Get the current hour (0-23) in UTC

    // Customize this query according to your entity structure and date field.
    return this.userRepository
      .createQueryBuilder('user')
      .where(
        `EXTRACT(DAY FROM TO_TIMESTAMP(user.date, 'YYYY-MM-DDTHH24:MI:SS.MS"Z"')) = :day`,
        { day },
      )
      .andWhere(
        `EXTRACT(MONTH FROM TO_TIMESTAMP(user.date, 'YYYY-MM-DDTHH24:MI:SS.MS"Z"')) = :month`,
        { month },
      )
      .andWhere(
        `EXTRACT(HOUR FROM TO_TIMESTAMP(user.date, 'YYYY-MM-DDTHH24:MI:SS.MS"Z"')) = :hour`,
        { hour },
      )
      .getMany();
  }

  async resendEmail(): Promise<void> {
    const unsentEmail = await this.logRepository.find({
      where: { status: false },
      relations: ['user'],
    });
    unsentEmail.forEach(async (email) => {
      const messages = `Hey, ${email.user.firstName} ${email.user.lastName} it’s your birthday`;
      const response = await this.sendEmail(messages, email.user.email);
      email.status = response == 200 ? true : false;
      await this.logRepository.save(email);
    });
  }

  async sendBirthdayEmail(logs: EmailLog[], user: User) {
    const year = new Date().getUTCFullYear();
    const checkLog = logs.filter((log) => {
      const isYearMatch = log.timestamp.getFullYear() === year;
      const isVersionMatch = log.version === user.version;
      return isYearMatch && isVersionMatch;
    });

    const messages = `Hey, ${user.firstName} ${user.lastName} it’s your birthday`;

    if (checkLog.length == 0) {
      const response = await this.sendEmail(messages, user.email);
      const emailLog = new EmailLog();
      emailLog.user = user;
      emailLog.status = response == 200 ? true : false;
      emailLog.version = user.version;
      await this.logRepository.save(emailLog);
    }
  }

  async sendEmail(message: string, email: string) {
    const url = 'https://email-service.digitalenvision.com.au/send-email';
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const data = {
      email: email,
      message: message,
    };
    const response = axios
      .post(url, data, { headers: headers })
      .then((response) => {
        return response.status;
      })
      .catch((error) => {
        return error.message;
      });
    return response;
  }
}
