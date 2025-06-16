import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
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
@Injectable()
export class CrawlService {
  constructor(@Inject('CRAWL') private client: ClientProxy,

    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly sagaStepRepository: SagaStepRepository,
) {}

  async crawlProfile(data: CrawlProfileDto) {
    const sagaInstance = await this.sagaInstanceRepository.create({
      status: SagaInstanceStatus.PENDING,
     type: SagaInstanceType.CRAWL_LIST_PROFILE,
     requestPayload: data,
    });
    const sagaStep = await this.sagaStepRepository.create({
      sagaInstanceId: sagaInstance._id,
      status: SagaStepStatus.PENDING,
      requestPayload: data,
      order:1,
      stepName: 'Crawl List Profile',
    });
    return this.client.emit('process_crawl', {
      payload: data,
      metadata: {
        sagaInstanceId: sagaInstance._id,
        sagaStepId: sagaStep._id,
      }
    });  }
  async crawlSingleProfile(data: CrawlProfileDto) {

    return this.client.emit('process_crawl_single', data); // "" nghĩa là default exchange
  }
}
