import type { IChickenRepository } from "../domain/repository";

export async function deleteChicken(
  repo: IChickenRepository,
  id: string,
  userId: string
): Promise<boolean> {
  return repo.delete(id, userId);
}
