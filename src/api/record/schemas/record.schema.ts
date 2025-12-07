import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { RecordCategory, RecordFormat } from '../enums/record.enum';

export type RecordHydrated = HydratedDocument<Record>;

export interface IRecord {
  artist: string;
  album: string;
  price: number;
  qty: number;
  format: RecordFormat;
  category: RecordCategory;
  mbid?: string;
}

@Schema({
  timestamps: {
    createdAt: 'created',
    updatedAt: 'lastModified',
  }
})
export class Record extends Document implements IRecord {
  @Prop({ required: true })
  artist: string;

  @Prop({ required: true })
  album: string;

  @Prop({ required: true, index: true })
  price: number;

  @Prop({ required: true })
  qty: number;

  @Prop({ enum: RecordFormat, required: true })
  format: RecordFormat;

  @Prop({ enum: RecordCategory, required: true })
  category: RecordCategory;

  @Prop({ required: false, index: true })
  mbid?: string;
}

export const RecordSchema = SchemaFactory.createForClass(Record)

// Indexes for assumed most used combinations
// Artist and category are the first of the composites so we can skip the 
// single key index for these
RecordSchema.index({ artist: 1, album: 1, format: 1 }, { unique: true })
RecordSchema.index({ category: 1, format: 1 })

// Text index due to search query field
RecordSchema.index(
  {
    artist: 'text',
    album: 'text',
  },
  {
    name: 'record_artist_album_index',
  },
);