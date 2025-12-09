import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderHydrated } from 'src/api/order/schemas/order.schema';
import { Record, RecordHydrated } from 'src/api/record/schemas/record.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderHydrated>,
    @InjectModel(Record.name)
    private readonly recordModel: Model<RecordHydrated>,
  ) {}

  async getFinancialStats() {
    const stats = await this.orderModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$status',
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          orderCount: { $sum: 1 },
          totalItems: { $sum: '$items.quantity' },
        },
      },
    ]);

    const overall = await this.orderModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ['$items.quantity', '$items.price'] },
          },
          orderCount: { $addToSet: '$_id' },
          totalItemsSold: { $sum: '$items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          orderCount: { $size: '$orderCount' },
          totalItemsSold: 1,
        },
      },
    ]);

    return {
      byStatus: stats.map((stat) => ({
        status: stat._id,
        revenue: stat.totalRevenue,
        orderCount: stat.orderCount,
        itemCount: stat.totalItems,
      })),
      overall: overall[0] || {
        totalRevenue: 0,
        orderCount: 0,
        totalItemsSold: 0,
      },
    };
  }

  async getLowStockRecords(threshold: number = 5) {
    const lowStockRecords = await this.recordModel
      .find({
        qty: { $lte: threshold },
      })
      .sort({ qty: 1 })
      .lean()
      .exec();

    return lowStockRecords.map((record) => ({
      _id: record._id?.toString() || '',
      artist: record.artist,
      album: record.album,
      format: record.format,
      category: record.category,
      price: record.price,
      qty: record.qty,
      mbid: record.mbid,
    }));
  }
}
