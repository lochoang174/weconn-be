import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubcriptionRepository } from './subcription.repository';
import { Subcription, SubcriptionSchema } from './subcription.schema';
import { DatabaseModule } from '@app/common/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path/win32';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/payment/.env'),
    }),
    DatabaseModule.forRoot({
      payment: 'PAYMENT_URI',
    }),
    MongooseModule.forFeature(
      [{ name: Subcription.name, schema: SubcriptionSchema }],
      'payment',
    ),
  ],
  providers: [SubcriptionRepository],
  exports: [SubcriptionRepository],
})
export class SubcriptionModule {}
