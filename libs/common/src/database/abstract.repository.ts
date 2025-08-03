import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>) {
    // The .lean() method returns a plain JavaScript object, not a Mongoose document.
    // If you need Mongoose document features (e.g. .save()), remove .lean()
    const document = await this.model.findOne(filterQuery, {}).lean();

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true, // Return plain JavaScript object
      new: true, // Return the modified document rather than the original
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>, // Partial because in an upsert, some fields might be optional
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true, // Create the document if it doesn't exist
      new: true,
    });
  }

  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  // --- Thêm hàm deleteOne ---
  async deleteOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.model.deleteOne(filterQuery);

    if (result.deletedCount === 0) {
      this.logger.warn(
        'Document not found for deletion with filterQuery',
        filterQuery,
      );
      // Bạn có thể chọn throw NotFoundException hoặc trả về result tùy theo logic mong muốn
      // throw new NotFoundException('Document to delete not found.');
    }
    // Log thành công nếu muốn
    // this.logger.log(`Successfully deleted document with filterQuery:`, filterQuery);
    return result; // Trả về kết quả từ Mongoose
  }

  // --- Hoặc nếu bạn muốn hàm deleteMany ---
  async deleteMany(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.model.deleteMany(filterQuery);

    if (result.deletedCount === 0) {
      this.logger.warn(
        'No documents found for deletion with filterQuery',
        filterQuery,
      );
      // Tương tự, có thể throw hoặc không tùy logic
    }
    return result;
  }
}
