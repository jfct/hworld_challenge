import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { PAGINATION_LIMIT_VALUE } from 'src/api/utils/settings/pagination-settings';
import { TracklistSyncService } from 'src/workers/tracklist-sync/tracklist-sync.service';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { RecordResponseDto } from '../dtos/record-response.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { SearchRecordResponseDto } from '../dtos/search-record.response.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { InsufficientQuantityError } from '../errors/insufficient-quantity.error';
import { Record, RecordHydrated } from '../schemas/record.schema';

@Injectable()
export class RecordService {
  private readonly logger = new Logger(RecordService.name);

  constructor(
    @InjectModel(Record.name)
    private readonly recordModel: Model<RecordHydrated>,
    private readonly tracklistSyncService: TracklistSyncService,
  ) {}

  async create(request: CreateRecordRequestDto) {
    const newRecord = await this.recordModel.create(request);

    if (!newRecord) {
      throw new InternalServerErrorException('Error creating record');
    }

    if (request.mbid) {
      await this.tracklistSyncService.queueSyncJob(newRecord.id, request.mbid);
    }

    this.logger.debug(
      `A new record has been added! - ${request.album} by ${request.artist}`,
    );

    return newRecord.toObject();
  }

  async update(id: string, request: UpdateRecordRequestDto) {
    const existing = await this.recordModel.findById(id);
    if (!existing) {
      throw new NotFoundException('Record not found');
    }

    // We only queue a job if we change the mbid
    // If we didn't have a record but we add it
    // or we change the mbid
    if (request.mbid && (!existing.mbid || existing.mbid !== request.mbid)) {
      existing.tracks = null;
      existing.tracksSyncedAt = null;

      await this.tracklistSyncService.queueSyncJob(id, request.mbid);
    }

    Object.assign(existing, request);

    const updated = await existing.save();

    return updated.toObject();
  }

  async findById(id: string): Promise<RecordHydrated> {
    return this.recordModel.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<RecordResponseDto[]> {
    const records = await this.recordModel
      .find({ _id: { $in: ids } })
      .lean<RecordResponseDto[]>()
      .exec();

    return records;
  }

  async decrementQuantity(
    recordId: string,
    quantity: number,
    session: ClientSession,
  ): Promise<void> {
    const record = await this.recordModel
      .findById(recordId)
      .session(session)
      .lean<RecordResponseDto>()
      .exec();

    if (!record) {
      throw new NotFoundException(`Record ${recordId} not found`);
    }

    // Check if we have sufficient quantity before attempting the decrement
    if (record.qty < quantity) {
      throw new InsufficientQuantityError(record, quantity, record.qty);
    }

    const updated = await this.recordModel
      .findByIdAndUpdate(
        recordId,
        { $inc: { qty: -quantity } },
        { new: true, session },
      )
      .exec();

    this.logger.debug(
      `Processing ${quantity} from ${record.album} (${record.artist}) - Current: ${updated.qty}`,
    );

    // Double-check for race conditions (quantity shouldn't go negative)
    if (!updated || updated.qty < 0) {
      throw new InsufficientQuantityError(record, quantity, record.qty);
    }
  }

  async findAll(
    filters: SearchRecordRequestDto,
  ): Promise<SearchRecordResponseDto> {
    const {
      id,
      query: textFilter,
      artist,
      album,
      format,
      category,
      price,
      mbid,
      tracks,
      limit = PAGINATION_LIMIT_VALUE,
      page = 1,
    } = filters;
    const skip = (page - 1) * limit;
    const query: any = {};

    if (id) {
      query._id = id;
    }

    // General query that matches artist, album (Uses text index)
    if (textFilter) {
      query.$text = { $search: textFilter };
    }

    if (artist) {
      query.artist = { $regex: artist, $options: 'i' };
    }

    if (album) {
      query.album = { $regex: album, $options: 'i' };
    }

    if (format && format.length > 0) {
      query.format = { $in: format };
    }

    if (category && category.length > 0) {
      query.category = { $in: category };
    }

    if (price !== undefined) {
      query.price = price;
    }

    if (mbid) {
      query.mbid = mbid;
    }

    if (tracks && tracks.length > 0) {
      query['tracks.title'] = { $in: tracks };
    }

    try {
      const [results, count] = await Promise.all([
        this.recordModel
          .find(query)
          .lean<RecordResponseDto[]>()
          .skip(skip)
          .limit(limit)
          .exec(),
        this.recordModel.find(query).countDocuments().exec(),
      ]);

      return {
        results,
        count,
        page: page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Internal error filtering records: ${error}`,
      );
    }
  }
}
