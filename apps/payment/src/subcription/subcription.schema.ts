import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
<<<<<<< HEAD
import { Document, Types } from 'mongoose';
import { SubscriptionType } from 'proto/payment';

export type SubcriptionDocument = Subcription & Document;

@Schema({
  timestamps: false, // Adds createdAt and updatedAt fields
})
export class Subcription extends AbstractDocument {
  @Prop({ required: true })
  _id?: Types.ObjectId;

  @Prop({ required: true })
  credits: number;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Number, enum: SubscriptionType }) // <-- Fix here
  type: SubscriptionType;

  // optional fields quantity
  @Prop({ type: Number })
  quantity?: number;
=======
import { Document } from 'mongoose';

export type GuestDocument = Subcription & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Subcription extends AbstractDocument {
  @Prop({ required: true, unique: true })
  userId: string;

>>>>>>> e039a3fc1fc7d0c0a664cce623d141a11cfec48d
}

export const SubcriptionSchema = SchemaFactory.createForClass(Subcription);
