export function ConfirmationStep({
  orderId,
  onViewOrder,
}: {
  orderId: string | null;
  onViewOrder: () => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Confirmation</h2>
      <p className="text-muted-foreground">
        Thank you. Your order{orderId ? " is ready" : " was placed"}.
      </p>
      {orderId ? (
        <button
          type="button"
          className="h-11 bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
          onClick={onViewOrder}
        >
          View order
        </button>
      ) : (
        <a
          href="/account"
          className="inline-flex h-11 items-center bg-amber px-6 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        >
          Account
        </a>
      )}
    </div>
  );
}
