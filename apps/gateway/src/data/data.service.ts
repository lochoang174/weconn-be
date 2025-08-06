import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { BOT_CRUD_SERVICE_NAME, BotCrudServiceClient } from 'proto/bot-crud';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DataService {
    private botCrudService: BotCrudServiceClient;

    constructor(
        @Inject(BOT_CRUD_SERVICE_NAME) private clientGrpc: ClientGrpc,
    ) { }
    async onModuleInit() {
        this.botCrudService =
            this.clientGrpc.getService<BotCrudServiceClient>('BotCrudService');


    }
    async getData(page, pageSize) {
        const res = await firstValueFrom(
            this.botCrudService.listVectors({
                page: page,
                pageSize: pageSize

            }),
        );
        return res
    }
    async removeListItem(items:string[]){
     const res = await firstValueFrom(
            this.botCrudService.removeVectors({
          req:items

            }),
        );
        return res
    }
}
