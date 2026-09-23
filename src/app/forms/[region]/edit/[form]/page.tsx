import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { SIGNUP_FIELD_DEFAULTS, PREREGISTER_FIELD_DEFAULTS, getFieldLabel } from "@/lib/form-defaults";
import AppShell from "@/components/AppShell";
import { updateFieldLabels, addCustomQuestion, removeCustomQuestion, type FormKind } from "./actions";

export const dynamic = "force-dynamic";

const FORM_META: Record<FormKind, { title: string; publicPath: string }> = {
  signup: { title: "Reminder signup form", publicPath: "signup" },
  preregister: { title: "Trade-in pre-registration form", publicPath: "preregister" },
};

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ region: string; form: string }>;
}) {
  const session = await requireSession();
  const { region: slug, form } = await params;

  if (form !== "signup" && form !== "preregister") notFound();
  const kind = form as FormKind;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const customization = kind === "signup" ? region.signup_form : region.preregister_form;
  const defaults = kind === "signup" ? SIGNUP_FIELD_DEFAULTS : PREREGISTER_FIELD_DEFAULTS;
  const meta = FORM_META[kind];

  const boundUpdateLabels = updateFieldLabels.bind(null, region.id, kind);
  const boundAddQuestion = addCustomQuestion.bind(null, region.id, kind);

  return (
    <AppShell
      userEmail={session.user!.email!}
      title={`Edit ${meta.title}`}
      subtitle={region.name}
    >
      <div className="mb-6">
        <Link
          href="/forms"
          className="text-[13px] font-medium text-slate-green-500 hover:text-turf-green-500"
        >
          ← Back to form links
        </Link>
      </div>

      <div className="space-y-6">
        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Question wording</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            Reword any question below. Leave a box blank (or matching the placeholder) to use the
            default wording. These are the built-in fields the form depends on, so they can&apos;t be
            removed — only reworded.
          </p>
          <form action={boundUpdateLabels} className="space-y-4">
            {Object.keys(defaults).map((key) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  name={`label_${key}`}
                  defaultValue={customization.field_labels[key] ?? ""}
                  placeholder={getFieldLabel(defaults, customization.field_labels, key)}
                  className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
                />
              </div>
            ))}
            <button
              type="submit"
              className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
            >
              Save wording
            </button>
          </form>
        </section>

        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Custom questions</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            Add extra free-text questions specific to your region. They&apos;ll appear at the end of the
            form, under &ldquo;A few more questions.&rdquo;
          </p>

          {customization.custom_questions.length > 0 && (
            <ul className="mb-5 divide-y">
              {customization.custom_questions.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="text-sm font-medium text-turf-green-500">{q.label}</div>
                    <div className="text-xs text-slate-green-500">
                      {q.required ? "Required" : "Optional"}
                    </div>
                  </div>
                  <form action={removeCustomQuestion.bind(null, region.id, kind, q.id)}>
                    <button
                      type="submit"
                      className="rounded-md border px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-offwhite"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={boundAddQuestion} className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                New question
              </label>
              <input
                name="label"
                required
                placeholder="e.g. What size cleats do you wear?"
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-turf-green-500">
              <input type="checkbox" name="required" className="h-4 w-4" />
              Required
            </label>
            <button
              type="submit"
              className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
            >
              Add question
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
