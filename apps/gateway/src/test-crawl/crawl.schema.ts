import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';



export type UrlDocument = Url & Document;

@Schema({
  timestamps: true, // Adds createdAt and updatedAt fields
})
export class Url extends AbstractDocument {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true})
  status: string;


 

  @Prop() 
  bot_id: string;

  @Prop({
    type: String,
  })
  createAt: string;
}

export const UrlSchema = SchemaFactory.createForClass(Url);
