import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { SubscriptionType } from 'proto/payment';
import { User } from './schema/user.schema';

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);

  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  // Run every hour to distribute credits
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async distributeScheduledCredits() {
    this.logger.log('Starting scheduled credit distribution...');

    try {
      const now = new Date();

      // Find users with subscriptions that need credit distribution
      const usersWithPendingCredits: User[] = await this.userRepository.find({
        subscription: {
          $elemMatch: {
            type: SubscriptionType.MONTHLY,
            endDate: { $gt: now },
          },
        },
      });

      this.logger.log(
        `Found ${usersWithPendingCredits.length} users with pending credit distributions`,
      );

      for (const user of usersWithPendingCredits) {
        await this.processUserSubscriptions(user);
      }

      this.logger.log('Scheduled credit distribution completed');
    } catch (error) {
      this.logger.error('Error during scheduled credit distribution:', error);
    }
  }

  private async processUserSubscriptions(user: User) {
    const now = new Date();

    for (const subscription of user.subscription) {
      try {
        // Skip if already distributed credits today
        const lastDistribution = subscription.lastCreditDistribution;
        const isSameDay =
          lastDistribution &&
          new Date(lastDistribution).toDateString() === now.toDateString();

        // Check if subscription is complete and clear
        if (subscription.endDate <= now) {
          this.logger.log(
            `Subscription ${subscription._id} for user ${user._id} has ended.`,
          );
          await this.userRepository.findOneAndUpdate(
            { _id: user._id },
            {
              $pull: {
                subscription: { _id: subscription._id },
              },
            },
          );
          continue; // skip the credit distribution if subscription is removed
        }

        if (isSameDay) {
          this.logger.log(
            `Credits already distributed today for user ${user._id}, subscription ${subscription._id}. Skipping.`,
          );
          continue;
        }

        // Update user credits and subscription
        await this.userRepository.findOneAndUpdate(
          {
            _id: user._id,
            'subscription._id': subscription._id,
          },
          {
            $inc: {
              credits: subscription.credits,
            },
            $set: {
              'subscription.$.lastCreditDistribution': now,
            },
          },
        );

        this.logger.log(
          `Distributed ${subscription.credits} credits to user ${user._id} ` +
            `from subscription ${subscription._id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error distributing credits for user ${user._id}, subscription ${subscription._id}:`,
          error,
        );
      }
    }
  }

  // Manual method to trigger credit distribution (for testing)
  async triggerCreditDistribution() {
    this.logger.log('Manually triggering credit distribution...');
    await this.distributeScheduledCredits();
  }
}
