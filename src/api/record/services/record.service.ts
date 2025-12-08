import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { RecordResponseDto } from '../dtos/record-response.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { SearchRecordResponseDto } from '../dtos/search-record.response.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { Record, RecordHydrated } from '../schemas/record.schema';
import { PAGINATION_LIMIT_VALUE } from 'src/api/utils/settings/pagination-settings';
import { TracklistSyncService } from 'src/workers/tracklist-sync/tracklist-sync.service';

@Injectable()
export class RecordService {
  constructor(
    @InjectModel(Record.name)
    private readonly recordModel: Model<RecordHydrated>,
    private readonly tracklistSyncService: TracklistSyncService,
  ) {}

  async create(request: CreateRecordRequestDto) {
    const newRecord = await this.recordModel.create(request);
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
      await this.tracklistSyncService.queueSyncJob(id, request.mbid);
    }

    Object.assign(existing, request);
    const updated = await existing.save();

    return updated.toObject();
  }

  async findByIds(ids: string[]): Promise<RecordResponseDto[]> {
    const records = await this.recordModel
      .find({ _id: { $in: ids } })
      .lean<RecordResponseDto[]>()
      .exec();

    return records;
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
      limit = PAGINATION_LIMIT_VALUE,
      page = 1,
    } = filters;
    const skip = (page - 1) * limit;
    const query: any = {};

    if (id) {
      query._id = id;
    }

    // General query that matches artist, album
    if (textFilter) {
      query.$or = [
        { artist: { $text: textFilter, $options: 'i' } },
        { album: { $text: textFilter, $options: 'i' } },
      ];
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
      throw new InternalServerErrorException('Error filtering records');
    }
  }
}
