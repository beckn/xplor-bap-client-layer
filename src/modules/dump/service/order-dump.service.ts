import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schema/order.schema';
import { OrderDto } from '../dto/order-dump.dto';

@Injectable()
export class OrderDumpService {
  private readonly logger = new Logger(OrderDumpService.name);
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}
  async create(createOrderDto: OrderDto): Promise<Order> {
    return await this.orderModel.create(createOrderDto);
  }

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find();
  }

  async getStatus(transaction_id: string, user_id: string, item_id: string): Promise<Order[]> {
    return await this.orderModel.findOne({ transaction_id, item_id, user_id });
  }
  async updateStatus(transaction_id: string, user_id: string, item_id: string, status: string): Promise<Order[]> {
    return await this.orderModel.findOneAndUpdate({ transaction_id, item_id, user_id }, { status }, { new: true });
  }

  async findByTransactionId(transaction_id: string): Promise<Order> {
    return await this.orderModel.findOneAndUpdate({ transaction_id });
  }

  async findByKey(key: string, value: string): Promise<Order | Order[]> {
    return await this.orderModel.findOne({ [key]: value });
  }
  async findOrders(userId: string): Promise<any> {
    try {
      const orders = await this.orderModel
        .find({ user_id: userId })
        .populate({
          path: 'internal_item_id',
          select: { item_id: 1, descriptor: 1, price: 1, domain: 1, transaction_id: 1, _id: 1, 'provider.name': 1 },
        })
        .select({ item_id: 1, descriptor: 1, price: 1, domain: 1, transaction_id: 1, _id: 1, 'provider.name': 1 });

      this.logger.log(orders);
      return orders;
    } catch (error) {
      this.logger.error(error);
    }
  }
  async findOrdersCount(userId: string): Promise<any> {
    try {
      const orders = await this.orderModel.countDocuments({ user_id: userId });

      this.logger.log(orders);
      return orders;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findOrdersCountForDomain(userId: string): Promise<any> {
    try {
      const domainCounts = await this.orderModel
        .aggregate([
          { $match: { user_id: userId } }, // Filter orders by user_id
          {
            $group: {
              _id: '$domain', // Group by domain
              count: { $sum: 1 }, // Calculate count for each domain
            },
          },
        ])
        .exec();
      return domainCounts;
    } catch (error) {
      this.logger.error(error);
      throw error; // Rethrow the error to handle it in the caller function
    }
  }
}
