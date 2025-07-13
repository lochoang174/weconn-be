import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@app/common';
import { User } from './schema/user.schema';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(User.name);

  constructor(
    @InjectModel(User.name, 'user') userModel: Model<User>,
    @InjectConnection('user') connection: Connection,
  ) {
    super(userModel, connection);
  }
  async findByEmail(email: string): Promise<User> {
    return await this.model.findOne({ email: email });
  }
  async updateToken(refresh_token: string, id: string) {
    return await this.model.updateOne(
      { _id: id },
      { refreshToken: refresh_token },
    );
  }
}
