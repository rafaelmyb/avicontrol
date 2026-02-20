export interface BroodCycleEntity {
  id: string;
  chickenId: string;
  startDate: Date;
  eggCount: number;
  expectedHatchDate: Date;
  expectedReturnToLayDate: Date;
  actualHatchedCount: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBroodCycleInput {
  chickenId: string;
  startDate: Date;
  eggCount: number;
  expectedHatchDate: Date;
  expectedReturnToLayDate: Date;
  status: string;
}
