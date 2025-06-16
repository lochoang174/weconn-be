import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SagaInstance, SagaInstanceSchema } from './saga-instance.schema';
import { SagaInstanceRepository } from './saga-instance.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: SagaInstance.name, schema: SagaInstanceSchema }],
      'saga',
    ),
  ],
  providers: [SagaInstanceRepository],

  exports: [SagaInstanceRepository]
})
export class SagaInstanceModule { }
