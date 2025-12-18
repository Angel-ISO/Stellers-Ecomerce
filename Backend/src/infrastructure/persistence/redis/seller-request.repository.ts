import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis.service';
import { ISellerRequestRepository } from '../../../domain/repositories/seller-request.repository.interface';
import { SellerRequest } from '../../../domain/entities/seller-request.entity';

@Injectable()
export class RedisSellerRequestRepository implements ISellerRequestRepository {
  private readonly KEY_PREFIX = 'seller-request';
  private readonly USER_KEY_PREFIX = 'seller-request:user';
  private readonly PENDING_SET_KEY = 'seller-request:pending';

  constructor(private readonly redisService: RedisService) {}

  async create(request: SellerRequest): Promise<SellerRequest> {
    const key = `${this.KEY_PREFIX}:${request.id}`;
    const userKey = `${this.USER_KEY_PREFIX}:${request.userId}`;

    const requestData = {
      id: request.id,
      userId: request.userId,
      storeName: request.storeName,
      storeDescription: request.storeDescription,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };

    await this.redisService.set(key, requestData);

    if (request.status === 'PENDING') {
      await this.redisService.set(userKey, request.id);
      await this.redisService.sadd(this.PENDING_SET_KEY, request.id);
    }

    return request;
  }

  async findById(id: string): Promise<SellerRequest | null> {
    const key = `${this.KEY_PREFIX}:${id}`;
    const data = await this.redisService.get<any>(key);

    if (!data) {
      return null;
    }

    return this.mapToEntity(data);
  }

  async findByUserId(userId: string): Promise<SellerRequest | null> {
    const userKey = `${this.USER_KEY_PREFIX}:${userId}`;
    const requestId = await this.redisService.get<string>(userKey);

    if (!requestId) {
      return null;
    }

    return this.findById(requestId);
  }

  async findAllPending(): Promise<SellerRequest[]> {
    const pendingIds = await this.redisService.smembers(this.PENDING_SET_KEY);
    const requests: SellerRequest[] = [];

    for (const id of pendingIds) {
      const request = await this.findById(id);
      if (request && request.status === 'PENDING') {
        requests.push(request);
      }
    }

    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(id: string, updates: Partial<SellerRequest>): Promise<SellerRequest> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new Error(`Seller request with id ${id} not found`);
    }

    const updated = new SellerRequest(
      existing.id,
      existing.userId,
      updates.storeName ?? existing.storeName,
      updates.storeDescription ?? existing.storeDescription,
      updates.status ?? existing.status,
      existing.createdAt,
      new Date(),
    );

    const key = `${this.KEY_PREFIX}:${id}`;
    const userKey = `${this.USER_KEY_PREFIX}:${existing.userId}`;

    const requestData = {
      id: updated.id,
      userId: updated.userId,
      storeName: updated.storeName,
      storeDescription: updated.storeDescription,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    await this.redisService.set(key, requestData);

    if (updated.status !== 'PENDING') {
      await this.redisService.del(userKey);
      await this.redisService.srem(this.PENDING_SET_KEY, id);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const request = await this.findById(id);

    if (!request) {
      return;
    }

    const key = `${this.KEY_PREFIX}:${id}`;
    const userKey = `${this.USER_KEY_PREFIX}:${request.userId}`;

    await this.redisService.del(key);
    await this.redisService.del(userKey);
    await this.redisService.srem(this.PENDING_SET_KEY, id);
  }

  private mapToEntity(data: any): SellerRequest {
    return new SellerRequest(
      data.id,
      data.userId,
      data.storeName,
      data.storeDescription,
      data.status,
      new Date(data.createdAt),
      data.updatedAt ? new Date(data.updatedAt) : new Date(data.createdAt),
    );
  }
}

