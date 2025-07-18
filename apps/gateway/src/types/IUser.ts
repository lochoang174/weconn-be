import { SubscriptionType } from 'proto/payment';

export interface IUser {
  id: string;
  role: string;
  email: string;
  username: string;
  avatar: string;
  type: SubscriptionType;
  credits: number;
}
