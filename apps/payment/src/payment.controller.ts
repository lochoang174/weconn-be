import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import PayOSClass from '@payos/node';
import { WebhookDataType, WebhookType } from '@payos/node/lib/type';
import { Types } from 'mongoose';
import {
  CheckoutResponseDataType,
  CreatePaymentLinkRequest,
  SubscriptionType,
} from 'proto/payment';
import { PaymentRepository } from './payment.repository';
import { SubcriptionRepository } from './subcription/subcription.repository';
import { stat } from 'fs';

@Controller()
export class PaymentController {
  constructor(
    private readonly subcriptionRepository: SubcriptionRepository,
    private readonly paymentRepository: PaymentRepository,
    @Inject('PAYOS') private readonly payOS: PayOSClass,
  ) {}

  @GrpcMethod('PaymentService', 'Test')
  test(data: { userId: string }): { response: boolean } {
    console.log('Received Test call with userId:', data.userId);

    const isValidUser = !!data.userId;

    return { response: isValidUser };
  }

  // @GrpcMethod('PaymentService', 'GetAllSubscription')
  // async getAllSubscription() {
  //   console.log('Received GetAllSubscription call');

  //   const subscriptions = await this.subcriptionRepository.find({});
  //   console.log('Fetched subscriptions:', subscriptions);
  //   return { subscriptions };
  // }

  @GrpcMethod('PaymentService', 'GetAllSubscription')
  async getAllSubscription() {
    const subscriptions = await this.subcriptionRepository.find({});
    return { subscriptions };
  }

  @GrpcMethod('PaymentService', 'CreatePaymentLink')
  async createPaymentLink(
    data: CreatePaymentLinkRequest,
  ): Promise<CheckoutResponseDataType> {
    const CLIENT_DOMAIN = 'https://weconn-fe.tdung.com';
    const subcription = await this.subcriptionRepository.findOne({
      _id: new Types.ObjectId(data.subscriptionId),
    });

    const orderCode =
      typeof data.orderCode === 'number'
        ? data.orderCode
        : Number(data.orderCode) || Number(String(Date.now()).slice(-6));

    const subcriptionInfo: any = {
      _id: new Types.ObjectId(subcription._id),
      price: subcription.price,
      credits: subcription.credits,
      type: subcription.type || SubscriptionType.EACH,
    };

    if (data.quantity !== undefined) {
      subcriptionInfo.quantity = data.quantity;
    }

    const paymentDoc = await this.paymentRepository.create({
      orderId: orderCode,
      amount: data.amount || subcription.price,
      description: '', // will update later
      status: 'PENDING',
      userId: data.userId,
      createdAt: new Date(),
      subcription: subcriptionInfo,
      paymentLinkId: '',
    });

    const description = `${paymentDoc._id.toString()}`;

    const body = {
      orderCode,
      amount:
        subcriptionInfo.quantity !== undefined
          ? subcriptionInfo.price * subcriptionInfo.quantity
          : subcriptionInfo.price,

      description,
      returnUrl: data.returnUrl || `${CLIENT_DOMAIN}/payment-success`,
      cancelUrl: data.cancelUrl || `${CLIENT_DOMAIN}/pricing`,
    };

    try {
      const paymentLinkResponse = await this.payOS.createPaymentLink(body);
      console.log('Payment link created successfully:', paymentLinkResponse);
      await this.paymentRepository.updateOne(
        { _id: paymentDoc._id },
        {
          $set: {
            amount: paymentLinkResponse.amount,
            description,
            status: paymentLinkResponse.status,
            paymentLinkId: paymentLinkResponse.paymentLinkId,
          },
        },
      );
      return {
        bin: paymentLinkResponse.bin,
        accountNumber: paymentLinkResponse.accountNumber,
        accountName: paymentLinkResponse.accountName,
        amount: paymentLinkResponse.amount,
        description: body.description,
        orderCode: paymentLinkResponse.orderCode.toString(),
        paymentLinkId: paymentLinkResponse.paymentLinkId,
        status: paymentLinkResponse.status,
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode,
        type: subcription.type || SubscriptionType.EACH, // Default to EACH if not provided
      };
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentLink')
  async getPaymentLink(data: { orderCode: string | number }) {
    console.log('Received GetPaymentLink call with orderCode:', data.orderCode);

    const paymentLink = await this.payOS.getPaymentLinkInformation(
      data.orderCode,
    );
    console.log('Fetched payment link:', paymentLink);
    return paymentLink;
  }

  @GrpcMethod('PaymentService', 'HandleWebhook')
  async handleWebhook(req: WebhookType): Promise<WebhookDataType> {
    console.log('Received HandleWebhook call with data:', req);

    if (!req.hasOwnProperty('success')) {
      return;
    }

    const webhookData = this.payOS.verifyPaymentWebhookData(req);

    // Process the webhook data and return a response

    return webhookData;
  }

  @GrpcMethod('PaymentService', 'GetPaymentById')
  async getPaymentById(data: { paymentId: string; status?: string }) {
    console.log('Received GetPaymentById call with paymentId:', data.paymentId);

    if (
      data.status &&
      !['PENDING', 'SUCCESS', 'FAILED'].includes(data.status)
    ) {
      throw new Error('Invalid status provided');
    }

    if (!data.paymentId) {
      throw new Error('Payment ID is required');
    }
    if (!Types.ObjectId.isValid(data.paymentId)) {
      throw new Error('Invalid payment ID format');
    }
    const payment = await this.paymentRepository.findOne({
      _id: new Types.ObjectId(data.paymentId),
    });

    //update status payment by id
    if (data.status) {
      await this.paymentRepository.updateOne(
        { _id: new Types.ObjectId(data.paymentId) },
        {
          $set: {
            status: data.status,
            amount: payment?.amount || 0,
            description: payment?.description || '',
            paymentLinkId: payment?.paymentLinkId || '',
          },
        },
      );
    }

    if (!payment) {
      throw new Error('Payment not found');
    }
    const subscription: any = {
      _id: payment.subcription._id.toString(),
      price: payment.subcription.price,
      credits: payment.subcription.credits,
      type: payment.subcription.type,
    };

    if (payment.subcription.quantity !== undefined) {
      subscription.quantity = payment.subcription.quantity;
    }

    console.log('Fetched payment:', payment);
    return {
      orderId: payment.orderId,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      paymentLinkId: payment.paymentLinkId,
      userId: payment.userId,
      subscription: subscription,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
