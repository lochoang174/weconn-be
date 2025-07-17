import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { Payment, PaymentSchema } from '../schema/payment.schema';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { SubcriptionModule } from './subcription/subcription.module';
import PayOS from '@payos/node';
import { PayOSModule } from './payos/payos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../apps/payment/.env'),
    }),
    DatabaseModule.forRoot({
      payment: 'PAYMENT_URI',
    }),
    // MongooseModule.forFeature(
    //   [{ name: Subcription.name, schema: SubcriptionSchema }],
    //   'payment',
    // ),
    MongooseModule.forFeature(
      [{ name: Payment.name, schema: PaymentSchema }],
      'payment', // ✅ matches the second argument in @InjectModel
    ),
    SubcriptionModule,
    PayOSModule, // Import PayOSModule to use PayOSProvider
  ],
  controllers: [PaymentController],
  providers: [PaymentRepository],
  exports: [PaymentRepository],
})
export class PaymentModule {}
