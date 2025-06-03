import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { ProfileCrawl } from './schemas/profile-crawl.schema';

@Injectable()
export class CrawlRepository extends AbstractRepository<ProfileCrawl> {
  protected readonly logger = new Logger(CrawlRepository.name);

  constructor(
    @InjectModel(ProfileCrawl.name, 'crawl') crawlModel: Model<ProfileCrawl>,
    @InjectConnection('crawl') connection: Connection,
  ) {
    super(crawlModel, connection);
  }
  async checkExist(urlProfile: string) {
    const profile = await this.model.findOne({ 'urlProfile': urlProfile });
    if (profile) {
      return false;
    }
    return true;
  }
  async findByProfileId(idProfile: number) {
    const profile = await this.model.findOne({ 'profile.id': idProfile });
    if (profile) {
      return profile;
    }
    return null;
  }
  async updateStatus(id: string, status: string) {
    const profile = await this.model.findByIdAndUpdate(id, { status }, { new: true });
    return profile;
  }
}
