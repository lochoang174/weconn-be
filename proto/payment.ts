// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.5
//   protoc               v3.20.3
// source: proto/payment.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Empty } from "../google/protobuf/empty";

export const protobufPackage = "payment";

/** Enum for subscription type */
export enum SubscriptionType {
  YEARLY = 0,
  EACH = 1,
  MONTHLY = 2,
  UNRECOGNIZED = -1,
}

export enum PaymentStatus {
  PENDING = 0,
  COMPLETED = 1,
  FAILED = 2,
  UNRECOGNIZED = -1,
}

/** Request and Response Messages */
export interface PaymentRequest {
  userId: string;
}

/** Subscription Data */
export interface Subscription {
  Id: string;
  price: number;
  credits: number;
  type: SubscriptionType;
  quantity: number;
}

export interface CreatePaymentLinkRequest {
  /** ✅ add this */
  userId: string;
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  subscriptionId: string;
  quantity: number;
}

/** Wrapper for list of subscriptions */
export interface SubscriptionList {
  subscriptions: Subscription[];
}

/** Checkout Response Data Type */
export interface CheckoutResponseDataType {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: string;
  paymentLinkId: string;
  status: string;
  checkoutUrl: string;
  qrCode: string;
  type: SubscriptionType;
}

export interface GetPaymentLinkRequest {
  orderCode: string;
}

export interface WebhookType {
  code: string;
  desc: string;
  success: boolean;
  data: WebhookDataType | undefined;
  signature: string;
}

export interface WebhookDataType {
  orderCode: string;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  counterAccountBankId: string;
  counterAccountBankName: string;
  counterAccountName: string;
  counterAccountNumber: string;
  virtualAccountName: string;
  virtualAccountNumber: string;
}

export interface GetPaymentByIdRequest {
  paymentId: string;
  /** Optional, to filter by status */
  status: string;
}

export interface PaymentResponse {
  /** ✅ fixed */
  Id: string;
  orderId: number;
  amount: number;
  description: string;
  /** ✅ use enum type */
  status: string;
  paymentLinkId: string;
  userId: string;
  createdAt: string;
  subscription: Subscription | undefined;
}

export interface GetPaymentHistoryResponse {
  payments: PaymentResponse[];
}

export const PAYMENT_PACKAGE_NAME = "payment";

/** Service Definition */

export interface PaymentServiceClient {
  test(request: PaymentRequest): Observable<PaymentResponse>;

  getAllSubscription(request: Empty): Observable<SubscriptionList>;

  createPaymentLink(request: CreatePaymentLinkRequest): Observable<CheckoutResponseDataType>;

  getPaymentLink(request: GetPaymentLinkRequest): Observable<CheckoutResponseDataType>;

  handleWebhook(request: WebhookType): Observable<WebhookDataType>;

  getPaymentById(request: GetPaymentByIdRequest): Observable<PaymentResponse>;

  getPaymentHistory(request: PaymentRequest): Observable<GetPaymentHistoryResponse>;

  getPaymentHistories(request: Empty): Observable<GetPaymentHistoryResponse>;
}

/** Service Definition */

export interface PaymentServiceController {
  test(request: PaymentRequest): Promise<PaymentResponse> | Observable<PaymentResponse> | PaymentResponse;

  getAllSubscription(request: Empty): Promise<SubscriptionList> | Observable<SubscriptionList> | SubscriptionList;

  createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CheckoutResponseDataType> | Observable<CheckoutResponseDataType> | CheckoutResponseDataType;

  getPaymentLink(
    request: GetPaymentLinkRequest,
  ): Promise<CheckoutResponseDataType> | Observable<CheckoutResponseDataType> | CheckoutResponseDataType;

  handleWebhook(request: WebhookType): Promise<WebhookDataType> | Observable<WebhookDataType> | WebhookDataType;

  getPaymentById(
    request: GetPaymentByIdRequest,
  ): Promise<PaymentResponse> | Observable<PaymentResponse> | PaymentResponse;

  getPaymentHistory(
    request: PaymentRequest,
  ): Promise<GetPaymentHistoryResponse> | Observable<GetPaymentHistoryResponse> | GetPaymentHistoryResponse;

  getPaymentHistories(
    request: Empty,
  ): Promise<GetPaymentHistoryResponse> | Observable<GetPaymentHistoryResponse> | GetPaymentHistoryResponse;
}

export function PaymentServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "test",
      "getAllSubscription",
      "createPaymentLink",
      "getPaymentLink",
      "handleWebhook",
      "getPaymentById",
      "getPaymentHistory",
      "getPaymentHistories",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PaymentService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PaymentService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PAYMENT_SERVICE_NAME = "PaymentService";
