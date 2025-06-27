
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { CrawlProfileDto } from './dto/crawlProfile.dto';
import { SagaInstanceRepository } from '../saga-instance/saga-instance.repository';
import { SagaStepRepository } from '../saga-step/saga-step.repository';
import { SagaInstanceStatus } from '../enum/SagaInstanceStatus';
import { SagaInstanceType } from '../enum/SagaInstanceType';
import { SagaStepStatus } from '../enum/SagaStepStatus';
import { BOT_SERVICE_NAME, BotCommand, BotCommand_CommandType, BotServiceClient } from 'proto/bot';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class CrawlService implements OnModuleInit {
  private botService: BotServiceClient;
  private commandStream$ = new ReplaySubject<BotCommand>(); // giữ stream sống

  @Inject(BOT_SERVICE_NAME)
  private clientGrpc: ClientGrpc;

  onModuleInit() {
  this.botService = this.clientGrpc.getService<BotServiceClient>(BOT_SERVICE_NAME);

  this.botService.streamBotCrawlUrl(this.commandStream$.asObservable()).subscribe({
    next: (log) => console.log('📥 Bot log:', log.message),
    error: (err) => { 
      console.error('❌ Stream error:', err);
      // Tùy chọn: tự động reconnect nếu cần
    }, 
    complete: () => {
      console.log('✅ Bot stream completed');
    },
  });
}    
 
 
  bot_processing(id:string) {
    console.log('🚀 Sending START command');
    this.commandStream$.next({ 
      botId: id, 
      type: BotCommand_CommandType.START,   
    } satisfies BotCommand);
  } 

  stop_bot_processing(id:string) {
    console.log('🛑 Sending STOP command');
    this.commandStream$.next({  
      botId: id,
      type: BotCommand_CommandType.STOP, 
    } satisfies BotCommand);
  } 
}
