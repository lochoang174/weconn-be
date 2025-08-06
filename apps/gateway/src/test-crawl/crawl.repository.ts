import { Injectable, Logger } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@app/common';
import { Url } from './crawl.schema';

@Injectable()
export class CrawlRepository extends AbstractRepository<Url> {
  protected readonly logger = new Logger(Url.name);

  constructor(
    @InjectModel(Url.name, 'crawl') crawlModel: Model<Url>,
    @InjectConnection('crawl') connection: Connection,
  ) {
    super(crawlModel, connection);
  }
  async getTotalUrlDocument() {
    let total = await this.model.find({}).exec();
    return total;
  }

  async getUrlsNotCompleted() {
    let urls = await this.model.find({
      status: { $nin: ['completed', 'failed'] }
    }).exec();
    return urls.map((url) => this.getLinkedInUsername(url.url)).filter(Boolean);
  }

  async updateUrlStatus(url: string, status: string) {
    try {
      console.log(`Updating status to ${status} for URL: ${url}`);

      // Debug: Kiểm tra xem URL có tồn tại trong database không
      const existingDoc = await this.model.findOne({ url: url }).exec();
      if (!existingDoc) {
        console.warn(`URL not found in database: ${url}`);
        // Thử tìm với pattern khác
        const allDocs = await this.model.find({}).limit(5).exec();
        console.log(
          'Sample URLs in database:',
          allDocs.map((doc) => doc.url),
        );
      }

      // Tìm URL với pattern linh hoạt (có thể có hoặc không có dấu / ở cuối)
      const urlPattern = url.replace(/\/$/, ''); // Bỏ dấu / ở cuối nếu có
      const result = await this.model
        .updateOne(
          {
            url: {
              $regex: `^${urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\/?$`,
              $options: 'i',
            },
          },
          { $set: { status: status } },
        )
        .exec();

      if (result.matchedCount > 0) {
        console.log(`Successfully updated status to ${status} for URL: ${url}`);
      } else {
        console.warn(`No document found to update for URL: ${url}`);
      }

      return result;
    } catch (error) {
      console.error(`Failed to update status for URL ${url}:`, error.message);
      throw error;
    }
  }

  getLinkedInUsername(url) {
    if (!url) return null;

    try {
      const parts = url.split('/');
      // Lọc bỏ các phần rỗng do dấu `/` ở cuối
      const nonEmpty = parts.filter(Boolean);
      return nonEmpty[nonEmpty.length - 1];
    } catch (err) {
      return null;
    }
  }
}
