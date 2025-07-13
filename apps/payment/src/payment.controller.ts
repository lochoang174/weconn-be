import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class PaymentController {
  @GrpcMethod('PaymentService', 'Test')
  test(data: { userId: string }): { response: boolean } {
    console.log('Received Test call with userId:', data.userId);

    const isValidUser = !!data.userId;

    return { response: isValidUser };
  }
}
