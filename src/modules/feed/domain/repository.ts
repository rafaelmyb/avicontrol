import type { FeedInventoryEntity, CreateFeedInventoryInput } from "./entities";

export type FeedListOrderBy = "purchaseDate" | "name" | "createdAt";
export type FeedListOrderDirection = "asc" | "desc";

export interface FeedListOptions {
  feedType?: string;
  orderBy?: FeedListOrderBy;
  orderDirection?: FeedListOrderDirection;
  skip?: number;
  take?: number;
}

export interface IFeedInventoryRepository {
  create(data: CreateFeedInventoryInput): Promise<FeedInventoryEntity>;
  findById(id: string, userId: string): Promise<FeedInventoryEntity | null>;
  findByUserId(userId: string, options?: FeedListOptions): Promise<FeedInventoryEntity[]>;
  countByUserId(userId: string, options?: Pick<FeedListOptions, "feedType">): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<FeedInventoryEntity, "name" | "feedType" | "weightKg" | "price" | "consumptionPerBirdGrams" | "purchaseDate">>
  ): Promise<FeedInventoryEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
