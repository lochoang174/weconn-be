import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class GatewayService {
  private client: ClientProxy;

 
  sendTestMessage() {
    // const payload = {
    //   action: 'compare_faces',
    //   url1: 'https://media.discordapp.net/attachments/1156832511436017676/1368603800054530180/anhthe.jpg?ex=6818d31d&is=6817819d&hm=60e3c2e23b048e11a3d684baeb8691e2fbbcd18d1c9e504f4af30216c9575bcb&=&format=webp&width=443&height=590',
    //   url2: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/473522647_122155951646318172_5870098979630024173_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=7QtU7pzxloUQ7kNvwFm1Vr0&_nc_oc=AdnBWh9QBUqAqXuBhjTxRiXcKwzNp5hPCQAwmnjn0sPUYJsaW-cj0zWww77O7CmJIIk&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=aSQjG99WlenwOXoxuK73tg&oh=00_AfHEx8pyEDddRx_BwOyyuAHT-qDjvovINA6hs-qy5gCQeg&oe=681D3F46',
    //   threshold: 0.7,
    // };

    // return this.client.emit('', payload); // "" nghĩa là default exchange
    const payload = {}
  }
}
