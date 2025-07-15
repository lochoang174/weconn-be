// src/payos/payos.provider.ts
import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import PayOSClass from '@payos/node'; // default import

export const PayOSProvider: Provider = {
  provide: 'PAYOS',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new PayOSClass(
      configService.get<string>('PAYOS_CLIENT_ID'),
      configService.get<string>('PAYOS_API_KEY'),
      configService.get<string>('PAYOS_CHECKSUM_KEY'),
    );
  },
};
