export function ReviewStep({
  loading,
  onBack,
  onPay,
}: {
  loading: boolean;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Payment</h2>
      <p className="text-sm text-muted-foreground">
        Review your order, then pay securely with PayHere (or place without live
        keys in sandbox).
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="h-11 border border-border px-6 text-xs uppercase tracking-[0.18em] sm:w-auto"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="button"
          disabled={loading}
          className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-60 sm:flex-1"
          onClick={onPay}
        >
          {loading ? "Processing…" : "Pay now"}
        </button>
      </div>
    </div>
  );
}
