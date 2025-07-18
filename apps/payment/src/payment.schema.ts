import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestDocument = Payment & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Payment extends AbstractDocument {
  @Prop({ required: true, unique: true })
  userId: string;

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
