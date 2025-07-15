import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { Payment } from '../schema/payment.schema';

@Injectable()
export class PaymentRepository extends AbstractRepository<Payment> {
  protected readonly logger = new Logger(PaymentRepository.name);

  constructor(
    @InjectModel(Payment.name, 'payment')
    paymentModel: Model<Payment>,
    @InjectConnection('payment') connection: Connection,
  ) {
    super(paymentModel, connection);
  }
  async findAllSubscriptions() {
    return this.model.find().exec();
  }

  updateOne(
    arg0: { _id: Types.ObjectId },
    arg1: {
      $set: {
        amount: number;
        description: string;
        status: string;
        paymentLinkId: string;
      };
    },
  ) {
    return this.model.updateOne(arg0, arg1).exec();
  }
}
