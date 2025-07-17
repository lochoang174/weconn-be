import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';

import { WebhookDataType, WebhookType } from '@payos/node/lib/type';
import { CreatePaymentLinkRequest } from 'proto/payment';
import { CurrentUser, Public } from '../decorator/customize';
import { IUser } from '../types/IUser';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('/')
  async createBot(@CurrentUser() user: IUser) {
    return this.paymentService.test(user);
  }

  //get all subscription
  @Get('/subscriptions')
  @Public()
  async getAllSubscription() {
    return this.paymentService.getAllSubscription();
  }

  @Get('/history')
  async getPaymentHistory(@CurrentUser() user: IUser) {
    return this.paymentService.getPaymentHistory(user.id);
  }

  @Get('/:paymentId')
  async getPaymentById(@Param('paymentId') paymentId: string) {
    return this.paymentService.getPaymentById(paymentId);
  }

  @Post('/create-payment-link')
  async createPaymentLink(
    @Body()
    body: CreatePaymentLinkRequest,
    @CurrentUser() user: IUser,
  ) {
    return this.paymentService.createPaymentLink(body, user.id);
  }

  @Post('/get-payment-link')
  async getPaymentLink(@Body() body: { orderCode: string }) {
    return this.paymentService.getPaymentLink(body.orderCode);
  }

  //webhook to handle payment status updates
  @Post('/webhook')
  @Public()
  @HttpCode(200) // đảm bảo không bị 500 do thiếu response
  async handleWebhook(@Body() body: any) {
    console.log('Received webhook:', body);
    try {
      await this.paymentService.handleWebhook(body);
      return { message: 'Webhook received successfully' };
    } catch (error) {
      console.error('Error in webhook handler:', error);

      // Nếu muốn webhook bên gửi không retry, vẫn trả về 200
      return { message: 'Webhook processing failed', error: error.message };

      // Nếu bạn muốn báo lỗi thật sự (PayOS sẽ retry nếu nhận lỗi 4xx/5xx)
      // throw new InternalServerErrorException('Webhook processing failed');
    }
  }

  // get all payment history by user
}
