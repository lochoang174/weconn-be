import { forwardRef, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoleEnum,
  User,
  UserDocument,
  UserTypeEnum,
} from './schema/user.schema';
import { UserRepository } from './user.repository';
import { IUser } from '../types/IUser';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  // async onModuleInit() {
  //   const user = await this.userModel.findOne({ email: "admin1@gmail.com" });
  //   if (!user) {
  //     const hashedPassword = await bcryptjs.hash("123456", 10);
  //     const newUser = new this.userModel({
  //       email: "admin1@gmail.com",
  //       password: hashedPassword,
  //       role: "admin",
  //       username: "admin",
  //       isCreatePassword: true,
  //       isEmailVerified: true,
  //     });
  //     await newUser.save();
  //   }
  // }
  async validate(email: string, name: string, avatar: string): Promise<User> {
    let user = await this.userRepository.findByEmail(email);

    if (!user) {
      user = await this.userRepository.create({
        avatar,
        email,
        role: RoleEnum.CLIENT,
        username: name,
        type: UserTypeEnum.NORMAL,
        credits: 10,
      });
    }

    return user;
  }

  updateToken = async (refresh_token: string, id: string) => {
    return await this.userRepository.updateToken(refresh_token, id);
  };

  async findById(id: string): Promise<User> {
    return await this.userRepository.findOne({ _id: id });
  }
  async updateCredits(id: string, credits: number): Promise<User> {
    if (typeof credits !== 'number') {
      throw new Error('Credits must be a number');
    }

    return await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $inc: { credits } },
    );
  }
}
