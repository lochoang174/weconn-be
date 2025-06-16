import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SagaStep, SagaStepSchema } from './saga-step.schema';
import { SagaStepRepository } from './saga-step.repository';

@Module({
  imports:[
      MongooseModule.forFeature(
          [{ name: SagaStep.name, schema: SagaStepSchema }],
          'saga',
        ),
  ],
  providers:[SagaStepRepository],
  exports:[SagaStepRepository]
})
export class SagaStepModule {}
