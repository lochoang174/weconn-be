import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientGrpc,

} from '@nestjs/microservices';

import { BOT_SERVICE_NAME, BotCommand, BotCommand_CommandType, BotServiceClient } from 'proto/bot';
import { ReplaySubject, Subject } from 'rxjs';
import { CrawlListProfileDto } from '../test-crawl/dto/crawlList.dto';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class CrawlService implements OnModuleInit {
  private botService: BotServiceClient;
  private commandStream$ = new ReplaySubject<BotCommand>(); // giữ stream sống
  private detailCommandStream$ = new ReplaySubject<BotCommand>(); // stream riêng cho crawl detail

  @Inject(BOT_SERVICE_NAME)
  private clientGrpc: ClientGrpc;
  constructor(    private readonly socketService: SocketService,
  ){   
  
  }        
  onModuleInit() {
    this.botService = this.clientGrpc.getService<BotServiceClient>(BOT_SERVICE_NAME);

    // Stream cho crawl URL
    this.botService.streamBotCrawlUrl(this.commandStream$.asObservable()).subscribe({
      next: (log) => {
        console.log('📥 Bot URL log:', log.message)
        let logEvent = `bot-${log.botId}-log`
        this.socketService.emitToAdminRoom(logEvent,log)
      },
      error: (err) => {
        console.error('❌ URL Stream error:', err);
        // Tùy chọn: tự động reconnect nếu cần 
      }, 
      complete: () => {  
        console.log('✅ Bot URL stream completed'); 
      },
    });

    // Stream cho crawl Detail
    this.botService.streamBotCrawlDetail(this.detailCommandStream$.asObservable()).subscribe({
      next: (log) => {
        let logEvent = `bot-${log.botId}-log`
        this.socketService.emitToAdminRoom(logEvent,log)

      },
      error: (err) => {
        console.error('❌ Detail Stream error:', err);
        // Tùy chọn: tự động reconnect nếu cần
      },
      complete: () => {
        console.log('✅ Bot Detail stream completed');
      },
    });
  }

  // URL Crawl functions
  bot_processing(id: string) {
    console.log('🚀 Sending START URL crawl command');
    this.commandStream$.next({
      botId: id,
      type: BotCommand_CommandType.START,
    } satisfies BotCommand);
  }

  stop_bot_processing(id: string) {
    console.log('🛑 Sending STOP URL crawl command');
    this.commandStream$.next({
      botId: id,
      type: BotCommand_CommandType.STOP,
    } satisfies BotCommand);
  }

  // Detail Crawl functions
  start_bot_detail_processing(id: string) {
    console.log('🚀 Sending START Detail crawl command');
    this.detailCommandStream$.next({
      botId: id,
      type: BotCommand_CommandType.START,
    } satisfies BotCommand);
  }

  stop_bot_detail_processing(id: string) {
    console.log('🛑 Sending STOP Detail crawl command');
    this.detailCommandStream$.next({
      botId: id,
      type: BotCommand_CommandType.STOP,
    } satisfies BotCommand);
  }

}