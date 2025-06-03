import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageSearchService {
    constructor(
        @Inject('IMAGE') private client: ClientProxy
    ) { }
    async handleSearch(data: any) {
        const generatedUuid = uuidv4();
        let payload = {
            ...data,
            id: generatedUuid
        }
        this.client.emit('search_face', payload);
        return {
            id: generatedUuid

        }

    }
}
