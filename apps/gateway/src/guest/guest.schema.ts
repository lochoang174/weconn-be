import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestDocument = Guest & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Guest extends AbstractDocument {
  @Prop({ required: true, unique: true })
  guestId: string;

  @Prop({ type: Number, default: 3 })
  credits: number;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
