/**
 * Canonical money helpers.
 * Prisma returns Decimal for @db.Decimal columns; always convert via these
 * helpers before arithmetic, comparison, toFixed, or toLocaleString.
 */
import { Prisma } from "@prisma/client";

export type MoneyInput = number | string | Prisma.Decimal;

export function toDecimal(value: MoneyInput): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) return value;
  return new Prisma.Decimal(value);
}

export function toNumber(value: MoneyInput): number {
  return toDecimal(value).toNumber();
}

export function addMoney(a: MoneyInput, b: MoneyInput): Prisma.Decimal {
  return toDecimal(a).plus(toDecimal(b));
}

export function sumMoney(values: MoneyInput[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (acc, v) => acc.plus(toDecimal(v)),
    new Prisma.Decimal(0)
  );
}

export function gteMoney(a: MoneyInput, b: MoneyInput): boolean {
  return toDecimal(a).greaterThanOrEqualTo(toDecimal(b));
}

export function gtMoney(a: MoneyInput, b: MoneyInput): boolean {
  return toDecimal(a).greaterThan(toDecimal(b));
}

export function formatMoney(
  value: MoneyInput,
  currency = "KES",
  locale = "en-KE"
): string {
  return toNumber(value).toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
