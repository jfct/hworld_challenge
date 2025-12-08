import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig } from './app.config';
import { RecordModule } from './api/record/record.module';
import { OrderModule } from './api/order/order.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    MongooseModule.forRoot(AppConfig.mongoUrl),
    WorkersModule,
    RecordModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
