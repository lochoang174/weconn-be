import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import { SagaStepStatus } from "../enum/SagaStepStatus";
import { AbstractDocument } from "@app/common";



@Schema({ timestamps: true })
export class SagaStep extends AbstractDocument {

    @Prop({ required: true })
    stepName: string;
    @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'SagaInstance' })
    sagaInstanceId: Types.ObjectId;

    @Prop({ required: true })
    order: number;

    @Prop({
        required: true, enum: SagaStepStatus, default: SagaStepStatus.PENDING, type: String,
    })
    status: SagaStepStatus;

    @Prop({ type: SchemaTypes.Mixed })
    requestPayload?: Record<string, any>;

    @Prop({ type: SchemaTypes.Mixed })
    responsePayload?: Record<string, any>;

    @Prop()
    errorMessage?: string;
}
export const SagaStepSchema = SchemaFactory.createForClass(SagaStep);
