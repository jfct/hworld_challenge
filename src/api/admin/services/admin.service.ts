import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Record, RecordHydrated } from 'src/api/record/schemas/record.schema';
import { OrderStatus } from 'src/api/order/enums/order-status.enum';
import { OrderService } from 'src/api/order/services/order.service';
import { getRandomInt } from 'src/api/utils/get-random-int';
import { RecordCategory, RecordFormat } from 'src/api/record/enums/record.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Record.name)
    private readonly recordModel: Model<RecordHydrated>,
    private readonly orderService: OrderService,
  ) {}

  // The bulk creation is mostly for testing purposes
  async generateRandomOrders(count: number) {
    const records = await this.recordModel
      .find({ qty: { $gt: 0 } })
      .lean()
      .exec();
    if (records.length === 0) {
      throw new BadRequestException('No records with available stock');
    }

    const statuses = Object.values(OrderStatus);
    let created = 0;
    let failed = 0;

    for (let idx = 0; idx < count; idx++) {
      try {
        await this.createSingleOrder(records, statuses);
        created++;
      } catch (error) {
        failed++;
      }
    }

    return {
      created,
      failed,
      message: `Successfully created ${created} random orders${failed > 0 ? `, ${failed} failed` : ''}`,
    };
  }

  private async createSingleOrder(records: any[], statuses: OrderStatus[]) {
    const itemCount = getRandomInt(1, 5);
    const items = [];

    for (let idx = 0; idx < itemCount; idx++) {
      const record = records[getRandomInt(0, records.length - 1)];
      items.push({
        record: record._id as Types.ObjectId,
        quantity: getRandomInt(1, Math.min(3, record.qty)),
      });
    }

    const order = await this.orderService.create({ items });
    const status = statuses[getRandomInt(0, statuses.length - 1)];

    if (status !== OrderStatus.PENDING) {
      await this.orderService.update(order._id.toString(), { status });
    }

    return true;
  }

  async generateRandomRecords(count: number) {
    if (count <= 0 || count > 100000) {
      throw new BadRequestException('Count must be between 1 and 100,000');
    }

    const categories = Object.values(RecordCategory);
    const formats = Object.values(RecordFormat);

    const records = [];
    for (let i = 0; i < count; i++) {
      const isBand = getRandomInt(0, 1) === 0;
      const artistNumber = getRandomInt(1, isBand ? 10000 : 1000000);
      const artist = isBand ? `Band#${artistNumber}` : `Artist#${artistNumber}`;
      const albumNumber = getRandomInt(1, 10000);
      const album = `Album#${albumNumber}`;

      records.push({
        artist,
        album,
        price: getRandomInt(10, 100),
        qty: getRandomInt(0, 1000),
        format: formats[getRandomInt(0, formats.length - 1)],
        category: categories[getRandomInt(0, categories.length - 1)],
      });
    }

    const result = await this.recordModel.insertMany(records);

    return {
      created: result.length,
      message: `Successfully created ${result.length} random records`,
    };
  }
}
