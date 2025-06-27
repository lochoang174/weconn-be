import { AbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export enum BotStatus {
    STOP = "stop",
    RUNNING = "running",
    CRASH = "crash",
}

@Schema({ _id: true })
export class Bot extends AbstractDocument {
    @Prop({ required: true })
    bot_id: string;

    @Prop({ enum: BotStatus, default: BotStatus.STOP })
    status: BotStatus;

    @Prop({ required: false })
    error?: string;

    @Prop({ required: true })
    email: string;
    @Prop({ required: true })
    password: string;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
