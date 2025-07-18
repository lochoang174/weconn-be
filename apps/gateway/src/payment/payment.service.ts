import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { PAYMENT_PACKAGE_NAME, PAYMENT_SERVICE_NAME, PaymentRequest, PaymentServiceClient } from "proto/payment";
import { IUser } from "../types/IUser";
import { firstValueFrom } from "rxjs";

@Injectable()
export class PaymentService implements OnModuleInit {
  private paymentServiceClient: PaymentServiceClient;
  constructor(
    @Inject(PAYMENT_PACKAGE_NAME) private clientGrpc: ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentServiceClient = this.clientGrpc.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
  }
  async test(user:IUser){
    let request: PaymentRequest = {
        userId:user.id
    }
      const response = await firstValueFrom(
        this.paymentServiceClient.test(request),
      );
      return response
  }
}