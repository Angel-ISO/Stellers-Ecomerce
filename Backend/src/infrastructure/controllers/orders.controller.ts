import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateOrderUseCase } from '../../application/use-cases/orders/create-order.usecase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/orders/update-order-status.usecase';
import { GetOrdersUseCase } from '../../application/use-cases/orders/get-orders.usecase';
import { CreateOrderInput } from '../../application/dto/orders/create-order.input';
import { UpdateOrderStatusInput } from '../../application/dto/orders/update-order-status.input';
import { OrderOutput } from '../../application/dto/orders/order.output';
import { OrderStatus } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order data or products from different sellers',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Body() input: CreateOrderInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.createOrderUseCase.execute(input, user.id);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user orders (buyer or seller)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Orders retrieved successfully',
    type: [OrderOutput],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getUserOrders(@CurrentUser() user: CurrentUserData): Promise<OrderOutput[]> {
    return this.getOrdersUseCase.executeByBuyer(user.id);
  }

  @Get('seller')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders where user is seller' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Seller orders retrieved successfully',
    type: [OrderOutput],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async getSellerOrders(@CurrentUser() user: CurrentUserData): Promise<OrderOutput[]> {
    return this.getOrdersUseCase.executeBySeller(user.id);
  }

  @Get(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Get order by ID (must be buyer or seller)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not authorized to view this order',
  })
  async getOrderById(
    @Param('id') orderId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput | null> {
    const order = await this.getOrdersUseCase.executeById(orderId);

    if (!order) return null;

    if (order.buyerId !== user.id && order.sellerId !== user.id) {
      throw new Error('You are not authorized to view this order');
    }

    return order;
  }

  @Patch(':id/status')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Update order status (buyer or seller only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order status updated successfully',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not authorized to update this order status',
  })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() input: UpdateOrderStatusInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.updateOrderStatusUseCase.execute(orderId, input.status, user.id);
  }

  @Post(':id/pay')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Mark order as paid (seller only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as paid',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  async markAsPaid(
    @Param('id') orderId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.updateOrderStatusUseCase.execute(orderId, OrderStatus.PAID, user.id);
  }

  @Post(':id/ship')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Mark order as shipped (seller only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as shipped',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  async markAsShipped(
    @Param('id') orderId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.updateOrderStatusUseCase.execute(orderId, OrderStatus.SHIPPED, user.id);
  }

  @Post(':id/deliver')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Mark order as delivered (buyer only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order marked as delivered',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  async markAsDelivered(
    @Param('id') orderId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.updateOrderStatusUseCase.execute(orderId, OrderStatus.DELIVERED, user.id);
  }

  @Post(':id/cancel')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'Order unique identifier',
    example: 'order_123456789'
  })
  @ApiOperation({ summary: 'Cancel order (buyer or seller)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order cancelled',
    type: OrderOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid status transition',
  })
  async cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<OrderOutput> {
    return this.updateOrderStatusUseCase.execute(orderId, OrderStatus.CANCELLED, user.id);
  }
}