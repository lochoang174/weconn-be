import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { DataController } from './data.controller';
import { GrpcClientModule } from '../grpc-client/grpc-client.module';

@Module({
  controllers: [DataController],
  providers: [DataService],
  imports:[GrpcClientModule]
})
export class DataModule {}
