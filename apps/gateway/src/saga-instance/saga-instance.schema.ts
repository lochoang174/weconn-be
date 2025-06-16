import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import { SagaInstanceStatus } from "../enum/SagaInstanceStatus";
import { SagaInstanceType } from "../enum/SagaInstanceType";
import { AbstractDocument } from "@app/common";


@Schema({ timestamps: true })
export class SagaInstance extends AbstractDocument {


    @Prop({
        required: true, enum: SagaInstanceType, type: String, 
    })
    type: SagaInstanceType;

    @Prop({
        required: true, enum: SagaInstanceStatus, type: String,  
    })
    status: SagaInstanceStatus;

    @Prop({ type: SchemaTypes.Mixed })
    requestPayload?: Record<string, any>;

    @Prop({ type: SchemaTypes.Mixed })
    responsePayload?: Record<string, any>;



}
export const SagaInstanceSchema = SchemaFactory.createForClass(SagaInstance);
