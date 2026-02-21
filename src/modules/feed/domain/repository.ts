import type { FeedInventoryEntity, CreateFeedInventoryInput } from "./entities";

export type FeedListOrderBy = "purchaseDate" | "name" | "createdAt";
export type FeedListOrderDirection = "asc" | "desc";

export interface FeedListOptions {
  feedType?: string;
  batchName?: string;
  orderBy?: FeedListOrderBy;
  orderDirection?: FeedListOrderDirection;
  skip?: number;
  take?: number;
}

/** Minimal fields needed for restock-by-type computation (dashboard). */
export interface RestockDataRow {
  feedType: string;
  weightKg: number;
  purchaseDate: Date;
  consumptionPerBirdGrams: number;
}

export interface IFeedInventoryRepository {
  create(data: CreateFeedInventoryInput): Promise<FeedInventoryEntity>;
  findById(id: string, userId: string): Promise<FeedInventoryEntity | null>;
  findByUserId(userId: string, options?: FeedListOptions): Promise<FeedInventoryEntity[]>;
  findRestockDataByUserId(userId: string): Promise<RestockDataRow[]>;
  countByUserId(userId: string, options?: Pick<FeedListOptions, "feedType" | "batchName">): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<FeedInventoryEntity, "name" | "feedType" | "weightKg" | "price" | "consumptionPerBirdGrams" | "purchaseDate">>
  ): Promise<FeedInventoryEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
