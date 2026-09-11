export default async function UnsubscribeConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const message =
    status === "done"
      ? "You're unsubscribed. You won't get any more emails from SidelineSwap event campaigns."
      : status === "invalid"
        ? "That unsubscribe link isn't valid. If you keep getting emails you don't want, reply and let us know."
        : "Something went wrong processing your request. Please try the link again in a moment.";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-bold text-turf-green-500">SidelineSwap</h1>
      <p className="mt-4 max-w-sm text-sm text-slate-green-500">{message}</p>
    </main>
  );
}
