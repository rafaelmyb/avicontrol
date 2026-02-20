/**
 * Pure domain: chicken age in days.
 * ageInDays = currentDate - birthDate
 */
export function ageInDays(birthDate: Date, currentDate: Date): number {
  const birth = new Date(birthDate);
  const current = new Date(currentDate);
  const diff = current.getTime() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
