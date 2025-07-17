import { Injectable } from '@nestjs/common';

import { SubscriptionType } from 'proto/payment';
import { RoleEnum, User } from './schema/user.schema';
import { UserRepository } from './user.repository';

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
        type: SubscriptionType.EACH,
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
  async updateCredits(
    id: string,
    credits: number,
    type?: SubscriptionType,
  ): Promise<User> {
    if (typeof credits !== 'number') {
      throw new Error('Credits must be a number');
    }

    const updateObject: any = { $inc: { credits } };

    if (type !== undefined) {
      updateObject.type = type;
    }

    return await this.userRepository.findOneAndUpdate(
      { _id: id },
      updateObject,
    );
  }
}
