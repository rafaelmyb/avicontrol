import type { IFeedInventoryRepository } from "../domain/repository";

export async function deleteFeedInventory(
  repo: IFeedInventoryRepository,
  id: string,
  userId: string
): Promise<boolean> {
  return repo.delete(id, userId);
}
