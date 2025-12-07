import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { RecordResponseDto } from '../dtos/record-response.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { SearchRecordResponseDto } from '../dtos/search-record.response.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { Record, RecordHydrated } from '../schemas/record.schema';

@Injectable()
export class RecordService {

    constructor(
        @InjectModel(Record.name)
        private readonly recordModel: Model<RecordHydrated>
    ) 
    {}

    async create(request: CreateRecordRequestDto) {
        const newRecord = await this.recordModel.create(request);
        return newRecord.toObject();
    }

    async update(id: string, request: UpdateRecordRequestDto) {
        const record = await this.recordModel.findById(id);
        if (!record) {
            throw new InternalServerErrorException('Record not found');
        }

        Object.assign(record, request);

        const updated = await record.save();
        if (!updated) {
            throw new InternalServerErrorException('Failed to update record');
        }

        return updated.toObject();
    }

    async findAll(filters: SearchRecordRequestDto): Promise<SearchRecordResponseDto> {
        console.log(filters);
        const { query: textFilter, artist, album, format, category, price, mbid, limit, page } = filters;
        
        const query: any = {};

        // General query that matches artist, album
        if (textFilter) {
            query.$or = [
                { artist: { $regex: textFilter, $options: 'i' } },
                { album: { $regex: textFilter, $options: 'i' } },
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

        const [results, count] = await Promise.all([
            this.recordModel.find(query)
                .lean<RecordResponseDto[]>()
                .skip((page-1)*limit)
                .limit(limit)
                .exec(),
            this.recordModel.find(query)
                .countDocuments(),
        ]);

        return {
            results,
            count, 
            page: page,
            totalPages: Math.ceil(count / limit),
        };
    }
}
