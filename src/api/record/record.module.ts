import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordController } from './controllers/record.controller';
import { RecordSchema } from './schemas/record.schema';
import { RecordService } from './services/record.service';
import { WorkersModule } from 'src/workers/workers.module';
import { TrackListModule } from 'src/clients/tracklist/tracklist.module';

@Module({
  imports: [
    forwardRef(() => WorkersModule),
    // TODO: Testing pursposes only
    TrackListModule,
    MongooseModule.forFeature([{ name: 'Record', schema: RecordSchema }]),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
