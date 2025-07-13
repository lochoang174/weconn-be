import { UserTypeEnum } from '../user/schema/user.schema';

export interface IUser {
  id: string;
  role: string;
  email: string;
  username: string;
  avatar: string;
  type: UserTypeEnum;
  credits: number;
}
