import type { FeedInventoryEntity, CreateFeedInventoryInput } from "./entities";

export interface IFeedInventoryRepository {
  create(data: CreateFeedInventoryInput): Promise<FeedInventoryEntity>;
  findById(id: string, userId: string): Promise<FeedInventoryEntity | null>;
  findByUserId(userId: string): Promise<FeedInventoryEntity[]>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<FeedInventoryEntity, "name" | "feedType" | "weightKg" | "price" | "consumptionPerBirdGrams" | "purchaseDate">>
  ): Promise<FeedInventoryEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
