import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@app/common';
import { Guest } from './guest.schema';
import * as crypto from 'crypto';
@Injectable()
export class GuestRepository extends AbstractRepository<Guest> {
  protected readonly logger = new Logger(Guest.name);

  constructor(
    @InjectModel(Guest.name, 'user') guestModel: Model<Guest>,
    @InjectConnection('user') connection: Connection,
  ) {
    super(guestModel, connection);
  }
  private generateGuestId(userAgent: string, ip: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(`${userAgent}-${ip}`);
    return hash.digest('hex');
  }
  public async checkGuestId(userAgent: string, ip: string): Promise<Guest> {
    try {
      const guestId = this.generateGuestId(userAgent, ip);
      const check = await this.findOne({ guestId: guestId });
      return check;
    } catch (error) {
      this.logger.error('Error checking guest ID:', error);
      return null;
    }
  }
  public async createGuest(userAgent: string, ip: string): Promise<Guest> {
    try {
      const guestId = this.generateGuestId(userAgent, ip);
      const guest = await this.create({ guestId, credits: 3 });
      return guest;
    } catch (error) {
      this.logger.error('Error creating guest:', error);
      throw error;
    }
  }
  public async updateCredits(guestId: string, credits: number): Promise<Guest> {
    try {
      return await this.model
        .findOneAndUpdate(
          { guestId: guestId },
          { $inc: { credits: credits } },
          { new: true },
        )
        .exec();
    } catch (error) {
      this.logger.error('Error updating guest credits:', error);
      throw error;
    }
  }
}
