import { Module, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  [key: string]: string;
}

@Module({})
export class DatabaseModule {
  static forRoot(databases: DatabaseConfig): DynamicModule {
    const connections = Object.entries(databases).map(([name, configKey]) => {
      if (name === 'default') {
        return MongooseModule.forRootAsync({
          useFactory: (configService: ConfigService) => {
            const uri = configService.get<string>(configKey);
            console.log(`Database connection [${name}] using key [${configKey}]:`, uri);
            return { uri };
          },
          inject: [ConfigService], 
        });
      }
      
      return MongooseModule.forRootAsync({
        connectionName: name,
        useFactory: (configService: ConfigService) => {
          const uri = configService.get<string>(configKey);
          console.log(`Database connection [${name}] using key [${configKey}]:`, uri);
          return { uri };
        },
        inject: [ConfigService],
      });
    });

    return {
      module: DatabaseModule,
      imports: connections,
      exports: [MongooseModule],
    };
  }
}
