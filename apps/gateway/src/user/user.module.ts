import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { User, UserSchema } from './schema/user.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [{ name: User.name, schema: UserSchema }],
      'user',
    ),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, SubscriptionSchedulerService],
  exports: [UserService],
})
export class UserModule {}
