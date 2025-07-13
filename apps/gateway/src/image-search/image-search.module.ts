import { Module } from '@nestjs/common';
import { ImageSearchService } from './image-search.service';
import { ImageSearchController } from './image-search.controller';
import { RmqModule } from '@app/common';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';
import { UserModule } from '../user/user.module';
import { GuestModule } from '../guest/guest.module';

@Module({
  controllers: [ImageSearchController,
  ],
  imports: [RmqModule.register({
    name: 'IMAGE',
  }),
GrpcClientModule,
UserModule,
GuestModule
],
  providers: [ImageSearchService],
})
export class ImageSearchModule { }
