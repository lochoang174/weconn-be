import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { SubcriptionModule } from './subcription/subcription.module';

@Module({
  imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: join(__dirname, '../../../apps/payment/.env'),
        }),
        DatabaseModule.forRoot({
          payment: 'PAYMENT_URI',
        }),

        SubcriptionModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],

})
export class PaymentModule {}
