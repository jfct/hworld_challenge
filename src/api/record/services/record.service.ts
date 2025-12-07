import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRecordRequestDto } from '../dtos/create-record.request.dto';
import { SearchRecordRequestDto } from '../dtos/search-record.request.dto';
import { UpdateRecordRequestDto } from '../dtos/update-record.request.dto';
import { Record, RecordDocument } from '../schemas/record.schema';

@Injectable()
export class RecordService {

    constructor(
        @InjectModel(Record.name) private readonly recordModel: Model<RecordDocument>
    ) { }

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

    async findAll(filters: SearchRecordRequestDto) {
        // Use .lean() to get plain objects instead of Mongoose documents
        const allRecords = await this.recordModel.find().lean().exec();

        const { query: q, artist, album, format, category } = filters;

        const filteredRecords = allRecords.filter((record: any) => {
            let match = true;

            if (q) {
                match =
                    match &&
                    (record.artist.includes(q) ||
                        record.album.includes(q) ||
                        record.category.includes(q));
            }

            if (artist) {
                match = match && record.artist.includes(artist);
            }

            if (album) {
                match = match && record.album.includes(album);
            }

            if (format && format.length > 0) {
                match = match && format.includes(record.format);
            }

            if (category && category.length > 0) {
                match = match && category.includes(record.category);
            }

            return match;
        });

        return filteredRecords;
    }
}
