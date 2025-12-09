import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { StatsService } from './services/stats.service';
import { TrackListModule } from 'src/clients/tracklist/tracklist.module';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { Record, RecordSchema } from '../record/schemas/record.schema';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TrackListModule,
    OrderModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Record.name, schema: RecordSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, StatsService],
})
export class AdminModule {}
