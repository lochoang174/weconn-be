import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Payload } from '@nestjs/microservices';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello() {
    return this.gatewayService.sendTestMessage();
  }
  // @EventPattern('process_crawl')
  // async handle(@Payload() data: any) {
  //   console.log('received from A:', data);
  // }
}
