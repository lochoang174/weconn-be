import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreatePaymentLinkRequest,
  PAYMENT_PACKAGE_NAME,
  PAYMENT_SERVICE_NAME,
  PaymentRequest,
  PaymentServiceClient,
} from 'proto/payment';
import { IUser } from '../types/IUser';
import { firstValueFrom } from 'rxjs';
import { WebhookDataType, WebhookType } from '@payos/node/lib/type';
import { UserService } from '../user/user.service';

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentServiceClient: PaymentServiceClient;
  constructor(
    @Inject(PAYMENT_PACKAGE_NAME) private clientGrpc: ClientGrpc,
    private readonly userService: UserService, // Inject UserService to update credits
  ) {}

  onModuleInit() {
    this.paymentServiceClient =
      this.clientGrpc.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
  }
  async test(user: IUser) {
    let request: PaymentRequest = {
      userId: user.id,
    };
    const response = await firstValueFrom(
      this.paymentServiceClient.test(request),
    );
    return response;
  }

  async getAllSubscription() {
    const response = await firstValueFrom(
      this.paymentServiceClient.getAllSubscription({}),
    );
    return response;
  }

  async getPaymentById(paymentId: string, status?: string) {
    const response = await firstValueFrom(
      this.paymentServiceClient.getPaymentById({ paymentId, status }),
    );
    console.log('Payment by ID response:', response);
    return response;
  }

  // update status payment by id

  async createPaymentLink(body: CreatePaymentLinkRequest, userId: string) {
    const response = await firstValueFrom(
      this.paymentServiceClient.createPaymentLink({
        ...body,
        userId: userId,
      }),
    );
    return response;
  }

  async getPaymentLink(orderCode: string) {
    const response = await firstValueFrom(
      this.paymentServiceClient.getPaymentLink({ orderCode }),
    );
    return response;
  }

  async handleWebhook(body: WebhookType) {
    console.log('Received webhook:', body);
    // Convert orderCode to string if it exists and is a number
    const fixedBody = {
      ...body,
      data: {
        ...body.data,
        orderCode:
          body.data && typeof body.data.orderCode === 'number'
            ? String(body.data.orderCode)
            : body.data?.orderCode,
      },
    };
    const response = await firstValueFrom(
      this.paymentServiceClient.handleWebhook(fixedBody as any),
    );
    if (response.desc === 'success') {
      const payment = await this.getPaymentById(
        fixedBody.data.description,
        'SUCCESS',
      );
      console.log('Payment after webhook:', payment.subscription.quantity);
      this.userService.updateCredits(
        payment.userId,
        payment.subscription.quantity ?? payment.subscription.credits,
      );
    }
    return response;
  }
}
