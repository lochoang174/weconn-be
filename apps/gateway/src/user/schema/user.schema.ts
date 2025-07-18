import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export enum RoleEnum {
    ADMIN = 'admin',
    CLIENT = 'client',
}
export enum UserTypeEnum {
    NORMAL = 0,
    VIP = 1,
    PREMIUM = 2,
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
    @Prop({ type: String, enum: UserTypeEnum, default: UserTypeEnum.NORMAL })
    type: UserTypeEnum;

    @Prop({ type: Number, default: 10 })
    credits: number;


    @Prop()
    avatar: string;



    @Prop({
        type: String
    })
    refreshToken?: string;




}

export const UserSchema = SchemaFactory.createForClass(User);


