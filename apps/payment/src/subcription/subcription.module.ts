import { Module } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Subcription, SubcriptionSchema } from './subcription.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
    [{ name: Subcription.name, schema: SubcriptionSchema }],
    'payment',
  ),],
  // providers: [SubcriptionService],
})
export class SubcriptionModule { }
