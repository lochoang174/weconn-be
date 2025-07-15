import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SubscriptionType } from 'proto/payment';
import {
  Subcription,
  SubcriptionSchema,
} from '../src/subcription/subcription.schema';

@Schema({ _id: true })
export class Payment extends AbstractDocument {
  @Prop({ required: true })
  orderId: number; // 👈 add this

  @Prop()
  amount: number;

  @Prop()
  description: string;

  @Prop()
  status: string;

  @Prop()
  paymentLinkId: string;

  @Prop()
  userId: string;

  @Prop({ type: SubcriptionSchema, required: true })
  subcription: Subcription;

  @Prop()
  createdAt: Date;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
