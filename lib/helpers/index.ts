export const getPercentageValue = (value: number, total: number): string => {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${Math.round(percentage * 10) / 10}%`;
};

export const formatNum = (number: number, virg: number): string => {
  const result = Math.round(number * Math.pow(10, virg)) / Math.pow(10, virg);
  return result.toString().replace(".", ",");
};

export const convertisor = (value: number, baseUnit: string) => {
  if (value) {
    const stringValue = value.toString().split(".")[0];
    if (stringValue.length <= 6 && stringValue.length > 3) {
      return { value: value / 1000, unit: `k${baseUnit}`, divisor: 1000 };
    }

    if (stringValue.length <= 9 && stringValue.length > 6) {
      return { value: value / 1000000, unit: `M${baseUnit}`, divisor: 1000000 };
    }
  }

  return { value, unit: baseUnit, divisor: 1 };
};

export const formatter = (value: number): string => {
  return Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);
};
