import { Module } from '@nestjs/common';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';
import { UserModule } from '../user/user.module';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
    controllers: [PaymentController,
    ],
    imports: [
        GrpcClientModule,
        UserModule,

    ],
    providers: [PaymentService],
})
export class PaymentModule { }
