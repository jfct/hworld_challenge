import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrackInfoHydrated = HydratedDocument<TrackInfo>;

export interface ITrackInfo {
  title: string;
  length: number;
  position: number;
  releaseDate?: string;
}

@Schema({ _id: false })
export class TrackInfo implements ITrackInfo {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  length: number;

  @Prop({ required: true })
  position: number;

  @Prop({ required: false })
  releaseDate?: string;
}

export const TrackInfoSchema = SchemaFactory.createForClass(TrackInfo);
