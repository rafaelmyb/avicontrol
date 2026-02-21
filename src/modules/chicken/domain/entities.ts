/**
 * Chicken status in domain (camelCase as per spec).
 */
export type ChickenStatus =
  | "chick"
  | "pullet"
  | "laying"
  | "brooding"
  | "recovering"
  | "retired"
  | "sold"
  | "deceased";

export type ChickenSource = "purchased" | "hatched";

export interface ChickenEntity {
  id: string;
  userId: string;
  name: string;
  batchName: string | null;
  breed: string;
  birthDate: Date;
  status: ChickenStatus;
  source: ChickenSource;
  purchasePrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChickenInput {
  userId: string;
  name: string;
  batchName?: string | null;
  breed: string;
  birthDate: Date;
  status: ChickenStatus;
  source: ChickenSource;
  purchasePrice?: number | null;
}
