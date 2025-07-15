import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestDocument = Subcription & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Subcription extends AbstractDocument {
  @Prop({ required: true, unique: true })
  userId: string;

}

export const SubcriptionSchema = SchemaFactory.createForClass(Subcription);
