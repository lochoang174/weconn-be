import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}
  findAllSubscriptions() {
    return this.paymentRepository.findAllSubscriptions();
  }
  getHello(): string {
    return 'Hello World!';
  }
}
