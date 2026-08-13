export const PENALTY_CATEGORIES = [
  { value: "money", label: "💸 Soldi" },
  { value: "drink", label: "🍺 Bere" },
  { value: "food", label: "🍕 Cibo" },
  { value: "challenge", label: "🤡 Challenge" },
  { value: "other", label: "🎲 Altro" },
] as const;

export const PENALTY_PRESETS = [
  { title: "Offrire una birra", category: "drink" },
  { title: "Offrire una pizza", category: "food" },
  { title: "Pagare 10 €", category: "money", amount: "10" },
  { title: "Pagare 20 €", category: "money", amount: "20" },
  { title: "Cantare una canzone davanti al gruppo", category: "challenge" },
  { title: "Fare 20 flessioni", category: "challenge" },
  { title: "Mettere una foto scelta dal gruppo come storia", category: "challenge" },
  { title: "Portare la colazione al gruppo", category: "food" },
  { title: "Offrire il prossimo giro", category: "drink" },
  { title: "Fare una penitenza scelta dal vincitore", category: "other" },
] as const;

export function categoryLabel(value: string) {
  return PENALTY_CATEGORIES.find((item) => item.value === value)?.label ?? "🎲 Altro";
}
