import { Injectable } from '@nestjs/common';

import { Subscription, SubscriptionType } from 'proto/payment';
import { RoleEnum, User, UserSubscription } from './schema/user.schema';
import { UserRepository } from './user.repository';
import { Types } from 'mongoose';

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

  async createSubscription(
    userId: string,
    subscriptionData: Subscription,
  ): Promise<User> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 days from now

    // Now all fields match your schema
    const subscription: UserSubscription = {
      _id: new Types.ObjectId(),
      price: subscriptionData.price,
      credits: subscriptionData.credits,
      type: subscriptionData.type,
      startDate,
      endDate,
      lastCreditDistribution: startDate,
    };

    return await this.userRepository.findOneAndUpdate(
      { _id: userId },
      {
        $push: { subscription },
        $inc: { credits: subscriptionData.credits }, // Give first day credits
      },
    );
  }
  // Update subscription credits
  async updateSubscriptionCredits(
    userId: string,
    credits: number,
  ): Promise<User> {
    return await this.userRepository.findOneAndUpdate(
      { _id: userId },
      {
        $inc: {
          credits,
          'subscription.creditsDistributed': credits,
        },
        'subscription.lastCreditDistribution': new Date(),
      },
    );
  }

  // Check if user has active subscriptio
  // Get user's subscription info
  // async getSubscriptionInfo(userId: string): Promise<UserSubscription | null> {
  //   const user = await this.userRepository.findOne({ _id: userId });
  //   return user?.subscription || null;
  // }

  // Deactivate subscription
  async deactivateSubscription(userId: string): Promise<User> {
    return await this.userRepository.findOneAndUpdate(
      { _id: userId },
      {
        'subscription.isActive': false,
      },
    );
  }

  // Get subscription type from user's subscription
  // async getUserSubscriptionType(userId: string): Promise<SubscriptionType> {
  //   const user = await this.userRepository.findOne({ _id: userId });
  //   return user?.subscription?.type || SubscriptionType.EACH;
  // }

  // // Check if subscription is monthly
  // async isMonthlySubscriber(userId: string): Promise<boolean> {
  //   const user = await this.userRepository.findOne({ _id: userId });
  //   return user?.subscription?.type === SubscriptionType.MONTHLY;
  // }
}
