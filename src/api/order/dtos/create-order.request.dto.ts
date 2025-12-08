import { OmitType } from '@nestjs/swagger';
import { BaseOrderDto } from './base-order.dto';

export class CreateOrderRequestDto extends OmitType(BaseOrderDto, ['status']) {}
