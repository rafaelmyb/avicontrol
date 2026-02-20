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

export interface ChickenEntity {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: Date;
  status: ChickenStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChickenInput {
  userId: string;
  name: string;
  breed: string;
  birthDate: Date;
  status: ChickenStatus;
}
