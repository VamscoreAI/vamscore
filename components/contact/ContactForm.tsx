"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CONTACT } from "@/content/contact";
import { Arrow } from "@/components/ui";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

/**
 * The contact form. Mirrors the careers form's shape (`components/careers/
 * ApplySection.tsx`) — same FormData post, same status union, same
 * `aria-live` announcement — so the two behave identically for a reader.
 *
 * `?topic=` preselects "What is this about?", which is how the closing band's
 * "Start a project" and "Partner with Vamscore" land somewhere different despite both
 * pointing here. **The value is only honoured if it matches one of the field's
 * own options** — otherwise a crafted URL could write arbitrary text into a
 * field the reader believes they chose.
 *
 * `useSearchParams` opts this subtree into client-side rendering, so the caller
 * must wrap it in `<Suspense>`; `app/(site)/contact/page.tsx` does.
 */
export default function ContactForm() {
  const { form } = CONTACT;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const requestedTopic = useSearchParams().get("topic");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: new FormData(element),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? form.error });
        return;
      }
      setStatus({ kind: "sent" });
      element.reset();
    } catch {
      setStatus({ kind: "error", message: form.error });
    }
  }

  if (status.kind === "sent") {
    return (
      <div
        role="status"
        className="border-t-2 border-spring-green bg-cloud p-8 lg:p-10"
      >
        <p className="type-card text-carbon">{form.success}</p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="type-body mt-4 underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  const busy = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
      {form.fields.map((field) => (
        <div key={field.name} className={field.wide ? "md:col-span-2" : undefined}>
          <label
            htmlFor={`contact-${field.name}`}
            className="type-body block font-medium text-carbon"
          >
            {field.label}
            {/* "required" in words, not just a coloured asterisk — the colour
                alone conveyed it to sighted users. The input keeps its
                `required` attribute for assistive tech. */}
            {field.required && (
              <span className="ml-1 text-[13px] font-normal text-stone">
                (required)
              </span>
            )}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={`contact-${field.name}`}
              name={field.name}
              required={field.required}
              rows={6}
              placeholder={field.placeholder}
              className="type-body mt-2 w-full resize-y rounded border border-line bg-cloud px-4 py-3 text-carbon outline-none focus:border-carbon"
            />
          ) : field.type === "select" ? (
            <select
              id={`contact-${field.name}`}
              name={field.name}
              required={field.required}
              defaultValue={
                requestedTopic && field.options?.includes(requestedTopic)
                  ? requestedTopic
                  : ""
              }
              className="type-body mt-2 w-full rounded border border-line bg-cloud px-4 py-3 text-carbon outline-none focus:border-carbon"
            >
              <option value="" disabled>
                Please choose…
              </option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`contact-${field.name}`}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              autoComplete={
                field.name === "email"
                  ? "email"
                  : field.name === "name"
                    ? "name"
                    : field.name === "phone"
                      ? "tel"
                      : field.name === "company"
                        ? "organization"
                        : undefined
              }
              className="type-body mt-2 w-full rounded border border-line bg-cloud px-4 py-3 text-carbon outline-none focus:border-carbon"
            />
          )}
        </div>
      ))}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? form.sending : form.submit}
          {!busy && <Arrow />}
        </button>

        {/* Announced to screen readers as well as shown */}
        {/* flame, not flame-2 (3.41:1 vs 3.32:1), at weight 400 rather than the
            300 `type-body` carries, and prefixed with a mark so the failure is
            not signalled by colour alone. */}
        <p
          role="alert"
          aria-live="polite"
          className="mt-4 text-[16px] leading-6 font-normal text-flame"
        >
          {status.kind === "error" ? `⚠ ${status.message}` : ""}
        </p>
      </div>
    </form>
  );
}
