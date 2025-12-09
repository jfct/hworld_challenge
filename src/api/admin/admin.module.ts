import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { TrackListModule } from 'src/clients/tracklist/tracklist.module';

@Module({
  imports: [TrackListModule],
  controllers: [AdminController],
})
export class AdminModule {}
