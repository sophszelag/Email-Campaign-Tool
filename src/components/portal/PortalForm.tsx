export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-xl border border-portal-border bg-white p-6">
      <div className="mb-4 text-[13px] font-bold uppercase tracking-[0.08em] text-portal-ink-secondary">
        {title}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-portal-ink">
        {label}
        {required && <span className="text-portal-error"> *</span>}
      </label>
      {children}
      {error && <div className="text-xs text-portal-error">{error}</div>}
    </div>
  );
}

export const portalInputClass =
  "rounded-lg border-[1.5px] border-portal-border px-3.5 py-3 text-sm text-portal-ink placeholder:text-portal-ink-tertiary focus:border-green-500 focus:outline-none focus:ring-[3px] focus:ring-green-500/10 disabled:bg-portal-neutral-disabled disabled:text-portal-ink-tertiary";

/**
 * The mockup's "choice card" radio style — a selectable row, not a bare
 * radio dot. Selected styling is done with the CSS `:has()` selector
 * against the actual `:checked` input, so this needs no client-side
 * state/JS at all.
 */
export function RadioCard({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-portal-border p-3.5 has-[:checked]:border-green-500 has-[:checked]:bg-portal-green-tint hover:border-portal-border-hover">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required
        className="peer sr-only"
      />
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 border-portal-border-hover peer-checked:border-green-500 peer-checked:bg-green-500">
        <span className="hidden h-1.5 w-1.5 rounded-full bg-white peer-checked:block" />
      </span>
      <span className="flex-1 text-[13px] font-medium text-portal-ink">{label}</span>
    </label>
  );
}

export function PortalCheckbox({
  name,
  value,
  label,
  defaultChecked,
}: {
  name?: string;
  value?: string;
  label: React.ReactNode;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-1">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] border-portal-border-hover peer-checked:border-green-500 peer-checked:bg-green-500">
        <span className="hidden h-2 w-2 rounded-[2px] bg-white peer-checked:block" />
      </span>
      <span className="text-[13px] leading-relaxed text-portal-ink">{label}</span>
    </label>
  );
}

export function PortalButton({
  children,
  variant = "primary",
  type = "submit",
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "submit" | "button";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={
        variant === "primary"
          ? "flex-1 rounded-lg bg-green-500 px-5 py-3.5 text-sm font-bold text-[#0b2015] hover:bg-portal-green-hover disabled:opacity-50"
          : "flex-1 rounded-lg border-[1.5px] border-portal-border px-5 py-3.5 text-center text-sm font-bold text-portal-ink hover:border-portal-border-hover hover:bg-portal-neutral-disabled"
      }
    >
      {children}
    </button>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-md border border-portal-border border-l-[3px] border-l-green-500 bg-portal-neutral-disabled p-3.5 text-xs leading-relaxed text-portal-ink-secondary">
      {children}
    </div>
  );
}

export function SuccessState({
  title,
  message,
  note,
}: {
  title: string;
  message: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div className="mb-2 text-[22px] font-bold text-portal-header">{title}</div>
      <p className="mb-6 text-sm leading-relaxed text-portal-ink-secondary">{message}</p>
      {note}
    </div>
  );
}

export type CustomQuestionLike = { id: string; label: string; required: boolean };

/** Renders a region's extra custom questions as plain text fields, named `custom_<id>` so the action can pull them back out of the FormData by prefix. */
export function CustomQuestionFields({ questions }: { questions: CustomQuestionLike[] }) {
  if (questions.length === 0) return null;

  return (
    <FormSection title="A few more questions">
      {questions.map((q) => (
        <FormField key={q.id} label={q.label} required={q.required}>
          <input name={`custom_${q.id}`} required={q.required} className={portalInputClass} />
        </FormField>
      ))}
    </FormSection>
  );
}

export function EventBadge({
  eyebrow,
  name,
  sub,
}: {
  eyebrow: string;
  name: string;
  sub: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-3 rounded-xl border border-portal-border bg-white p-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-portal-green-tint-strong text-2xl">
        📍
      </div>
      <div className="flex-1">
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.06em] text-portal-ink-tertiary">
          {eyebrow}
        </div>
        <div className="text-sm font-semibold text-portal-ink">{name}</div>
        <div className="text-xs text-portal-ink-secondary">{sub}</div>
      </div>
    </div>
  );
}
