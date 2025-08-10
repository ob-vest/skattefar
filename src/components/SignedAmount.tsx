import { cn } from "@/lib/utils";
import { formatDKK } from "@/lib/format";

export type SignedAmountVariant = "neg" | "pos" | "neutral" | "deduction";

export function SignedAmount({
  value,
  variant,
  bold = false,
  className,
  periodDivisor = 1,
}: {
  value: number;
  variant: SignedAmountVariant;
  bold?: boolean;
  className?: string;
  periodDivisor?: number; // e.g. 12 for monthly display of annual values
}) {
  const colorClass =
    variant === "neg"
      ? "text-red-600"
      : variant === "pos"
      ? "text-emerald-600"
      : variant === "deduction"
      ? "text-muted-foreground"
      : "text-foreground";
  const sign = variant === "neg" ? "-" : variant === "pos" ? "+" : "";
  const displayValue = value / Math.max(1, periodDivisor);
  return (
    <span
      className={cn(
        "text-right",
        bold ? "font-medium" : "",
        colorClass,
        className
      )}>
      {sign}
      {formatDKK(displayValue)}
    </span>
  );
}

export default SignedAmount;
