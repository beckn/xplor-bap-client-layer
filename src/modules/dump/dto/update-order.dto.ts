import { PartialType } from '@nestjs/mapped-types';
import { OrderDto } from './order-dump.dto';

// Extends the CreateOrderDto class and makes all its properties optional, suitable for updating existing orders.
export class UpdateOrderDto extends PartialType(OrderDto) {}
