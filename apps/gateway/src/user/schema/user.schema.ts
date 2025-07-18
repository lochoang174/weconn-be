import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubscriptionType } from 'proto/payment';

export enum RoleEnum {
  ADMIN = 'admin',
  CLIENT = 'client',
}

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
  @Prop({
    type: Number,
    enum: SubscriptionType,
    default: SubscriptionType.EACH,
  })
  type: SubscriptionType;

  @Prop({ type: Number, default: 10 })
  credits: number;

  @Prop()
  avatar: string;

  @Prop({
    type: String,
  })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
