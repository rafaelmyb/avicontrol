export const FEED_TYPE_VALUES = ["pre_inicial", "crescimento", "postura"] as const;
export type FeedTypeValue = (typeof FEED_TYPE_VALUES)[number];

export const FEED_TYPE_LABELS: Record<FeedTypeValue, string> = {
  pre_inicial: "Pré-inicial",
  crescimento: "Crescimento",
  postura: "Postura",
};

export const FEED_TYPE_OPTIONS: { value: FeedTypeValue; label: string }[] = FEED_TYPE_VALUES.map(
  (value) => ({ value, label: FEED_TYPE_LABELS[value] })
);

export function getFeedTypeLabel(value: string): string {
  return FEED_TYPE_LABELS[value as FeedTypeValue] ?? value;
}
