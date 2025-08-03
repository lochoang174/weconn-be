import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subscription, SubscriptionType } from 'proto/payment';

export enum RoleEnum {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Schema({ _id: true })
export class UserSubscription {
  @Prop({ type: Types.ObjectId, auto: true }) // Auto-generate _id
  _id?: Types.ObjectId;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number })
  credits: number;

  @Prop({
    type: Number,
    enum: SubscriptionType,
    default: SubscriptionType.EACH,
  })
  type: SubscriptionType;

  // Additional subscription metadata
  @Prop({ type: Date, default: null })
  startDate: Date;

  @Prop({ type: Date, default: null })
  endDate: Date;

  @Prop({ type: Date, default: null })
  lastCreditDistribution: Date;
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class User extends AbstractDocument {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.CLIENT })
  role: RoleEnum;

  @Prop({ type: Number, default: 10 })
  credits: number;

  @Prop()
  avatar: string;

  @Prop({
    type: String,
  })
  refreshToken?: string;

  @Prop({ type: [UserSubscriptionSchema], default: [] })
  subscription?: UserSubscription[];
}

export const UserSchema = SchemaFactory.createForClass(User);
