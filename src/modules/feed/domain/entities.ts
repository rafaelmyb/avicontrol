export interface FeedInventoryEntity {
  id: string;
  userId: string;
  name: string;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedInventoryInput {
  userId: string;
  name: string;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: Date;
}
