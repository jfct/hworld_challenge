import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import {
  RecordCategory,
  RecordFormat,
} from '../src/api/record/enums/record.enum';
import { AppModule } from '../src/app.module';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let recordId: string;
  let orderId: string;
  let recordModel;
  let orderModel;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    recordModel = app.get('RecordModel');
    orderModel = app.get('OrderModel');
    await app.init();
  });

  it('should create an order', async () => {
    const createRecordDto = {
      artist: 'The Beatles',
      album: 'Abbey Road',
      price: 25,
      qty: 10,
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const recordResponse = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    recordId = recordResponse.body._id;

    const createOrderDto = {
      items: [
        {
          record: recordId,
          quantity: 2,
        },
      ],
    };

    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .send(createOrderDto)
      .expect(201);

    orderId = orderResponse.body._id;
    expect(orderResponse.body).toHaveProperty('items');
    expect(orderResponse.body.items).toHaveLength(1);
  });

  afterEach(async () => {
    if (orderId) {
      await orderModel.findByIdAndDelete(orderId);
    }
    if (recordId) {
      await recordModel.findByIdAndDelete(recordId);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
