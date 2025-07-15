import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model, Types } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@app/common';
import { Subcription } from './subcription.schema';
import * as crypto from 'crypto';
@Injectable()
export class SubcriptionRepository extends AbstractRepository<Subcription> {
  protected readonly logger = new Logger(Subcription.name);

  constructor(
    @InjectModel(Subcription.name, 'payment')
    subcriptionModel: Model<Subcription>,
    @InjectConnection('payment') connection: Connection,
  ) {
    super(subcriptionModel, connection);
  }

  // public async findAll(): Promise<Subcription[]> {
  //   try {
  //     return await this.model.find().exec();
  //   } catch (error) {
  //     this.logger.error('Error finding all subscriptions:', error);
  //     throw error;
  //   }
  // }
}
