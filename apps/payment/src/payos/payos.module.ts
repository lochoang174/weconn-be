import { Module } from '@nestjs/common';
import { PayOSProvider } from './payos.provider';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [ConfigModule],
  providers: [PayOSProvider],
  exports: [PayOSProvider], // export so it can be used elsewhere
})
export class PayOSModule {}
