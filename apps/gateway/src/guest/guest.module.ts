import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Guest, GuestSchema } from './guest.schema';
import { GuestRepository } from './guest.repository';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Guest.name, schema: GuestSchema }],
      'user',
    ),
  ],
  providers: [GuestRepository],
  exports: [GuestRepository],
})
export class GuestModule {}
