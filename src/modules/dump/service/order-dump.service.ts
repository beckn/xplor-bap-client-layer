import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from '../schema/order.schema';
import { OrderDto } from '../dto/order-dump.dto';
import { GetOrdersQueryDto } from '../../user/dto/get-orders-query.dto';
import { RateOrderDto } from '../../user/dto/rate.order';
import { OrderStatus } from '../../../common/constants/stg-constants';
import { UpdateOrderDto } from '../dto/update-order.dto';

@Injectable()
export class OrderDumpService {
  private readonly logger = new Logger(OrderDumpService.name);
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}
  async create(createOrderDto: OrderDto): Promise<Order> {
    return await this.orderModel.create(createOrderDto);
  }

  async upsertOrder(createOrderDto: OrderDto): Promise<Order> {
    return await this.orderModel.findOneAndUpdate({ transaction_id: createOrderDto.transaction_id }, createOrderDto, {
      upsert: true,
    });
  }

  async findAll(): Promise<Order[]> {
    return await this.orderModel.find();
  }
  async update(_id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.orderModel.findByIdAndUpdate(_id, updateOrderDto, { new: true }).exec(); // The `{ new: true }` option returns the updated document.
  }

  async getStatus(transaction_id: string, user_id: string, item_id: string): Promise<Order[]> {
    return await this.orderModel.findOne({ transaction_id, item_id, user_id });
  }
  async updateOrder(order_id: string, key: object): Promise<Order> {
    return await this.orderModel.findOneAndUpdate({ order_id: order_id }, { $set: key }, { new: true }).exec();
  }
  async updateByTransaction(transactionId: string, updateData: Partial<Order>): Promise<Order> {
    return this.orderModel.findOneAndUpdate({ transaction_id: transactionId }, updateData, { new: true }).exec();
  }

  async findByTransactionId(transaction_id: string): Promise<Order> {
    return await this.orderModel.findOneAndUpdate({ transaction_id });
  }

  async findByKey(key: string, value: string): Promise<Order> {
    return await this.orderModel.findOne({ [key]: value });
  }

  async findOrders(userId: string, paginationRequest: GetOrdersQueryDto): Promise<any> {
    try {
      const query: any = { user_id: userId };
      if (paginationRequest.status) {
        query['$or'] =
          paginationRequest.status === OrderStatus.TILL_IN_PROGRESS
            ? [
                {
                  'fulfillment.0.state.descriptor.code': {
                    $in: [OrderStatus.IN_PROGRESS, OrderStatus.NOT_STARTED, OrderStatus.STARTED, OrderStatus.APPROVED],
                  },
                },
                {
                  status: {
                    $in: [OrderStatus.IN_PROGRESS, OrderStatus.NOT_STARTED, OrderStatus.STARTED, OrderStatus.APPROVED],
                  },
                },
              ]
            : [
                { 'fulfillment.0.state.descriptor.code': paginationRequest.status },
                { status: paginationRequest.status },
              ];
      }

      const totalCount = await this.orderModel.countDocuments(query);
      const skip = (paginationRequest.page - 1) * paginationRequest.pageSize;
      this.logger.log('totalCount', totalCount);
      const orders = await this.orderModel
        .find(query)
        .select({
          item_id: 1,
          descriptor: 1,
          price: 1,
          domain: 1,
          transaction_id: 1,
          _id: 1,
          order_id: 1,
          user_id: 1,
          'provider.name': 1,
          'provider.id': 1,
          fulfillment: 1,
          payments: 1,
          rating: 1,
          status: 1,
          is_added_to_wallet: 1,
          certificate_url: 1,
        })
        .populate({
          path: 'item_details',
          select: {
            item_id: 1,
            descriptor: 1,
            price: 1,
            domain: 1,
            transaction_id: 1,
            _id: 1,
            order_id: 1,
            user_id: 1,
            fulfillment: 1,
            payments: 1,
          },
        })
        .skip(skip ?? 0)
        .limit(paginationRequest.pageSize ?? 10)
        .exec();

      return {
        totalCount,
        page: paginationRequest.page,
        pageSize: paginationRequest.pageSize,
        orders,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOrderById(userId: string, orderId: string): Promise<any> {
    try {
      const order = await this.orderModel
        .findOne({ user_id: userId, _id: orderId })
        .select({
          item_id: 1,
          descriptor: 1,
          price: 1,
          domain: 1,
          transaction_id: 1,
          _id: 1,
          order_id: 1,
          user_id: 1,
          'provider.name': 1,
          'provider.id': 1,
          fulfillment: 1,
          payments: 1,
          status: 1,
          rating: 1,
          is_added_to_wallet: 1,
          certificate_url: 1,
        })
        .populate({
          path: 'item_details',
          select: {
            item_id: 1,
            descriptor: 1,
            price: 1,
            domain: 1,
            transaction_id: 1,
            _id: 1,
            order_id: 1,
            user_id: 1,
            fulfillment: 1,
            payments: 1,
          },
        })
        .exec();

      return order;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
  async fetchOrderDetails(userId: string, transaction_id: string, item_id: string, order_id: string): Promise<any> {
    try {
      this.logger.log(userId, transaction_id, item_id, order_id);
      const orders = await this.orderModel.findOne({
        user_id: userId,
        transaction_id: transaction_id,
        item_id: item_id,
        order_id: order_id,
      });
      return orders;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async rateOrder(orderId: string, ratingRequest: RateOrderDto): Promise<any> {
    try {
      const rateOrder = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { 'rating.rating': ratingRequest.rating, 'rating.review': ratingRequest.review },
        { new: true },
      );

      this.logger.log(rateOrder);
      return rateOrder;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async updateIsAddedToWallet(orderId: string, isAddedToWallet: boolean): Promise<any> {
    try {
      const order = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { is_added_to_wallet: isAddedToWallet },
        { new: true },
      );
      return order;
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
