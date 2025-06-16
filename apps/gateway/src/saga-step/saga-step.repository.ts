import { Injectable, Logger } from "@nestjs/common";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { AbstractRepository } from '@app/common';
import { SagaStep } from "./saga-step.schema";

@Injectable()
export class SagaStepRepository extends AbstractRepository<SagaStep> {
    protected readonly logger = new Logger(SagaStep.name);
  
    constructor(
    @InjectModel(SagaStep.name, 'saga') crawlModel: Model<SagaStep>,
    @InjectConnection('saga') connection: Connection,
  ) {
    super(crawlModel, connection);
  }
}