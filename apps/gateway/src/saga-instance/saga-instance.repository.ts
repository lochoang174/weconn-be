import { Injectable, Logger } from "@nestjs/common";
import { SagaInstance } from "./saga-instance.schema";
import { Connection, Model } from "mongoose";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { AbstractRepository } from '@app/common';

@Injectable()
export class SagaInstanceRepository extends AbstractRepository<SagaInstance> {
    protected readonly logger = new Logger(SagaInstance.name);
  
    constructor(
    @InjectModel(SagaInstance.name, 'saga') crawlModel: Model<SagaInstance>,
    @InjectConnection('saga') connection: Connection,
  ) {
    super(crawlModel, connection);
  }
}