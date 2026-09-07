"use client";

import { useId, useRef, useState } from "react";
import { CAREERS, GENERAL_ROLE_ID } from "@/content/careers";
import { Arrow, cx } from "@/components/ui";

const { form: F, roles } = CAREERS;
const MAX_BYTES = F.maxMb * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "doc", "docx"];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; reference: string }
  | { kind: "error"; message: string };

const fieldClass =
  "w-full rounded border border-line bg-cloud px-4 py-3 text-[15px] outline-none transition-colors focus:border-carbon";

/**
 * Roles list and application form together, because clicking Apply on a role
 * pre-selects it in the form — they share state, so splitting them would mean
 * lifting that state somewhere artificial.
 */
export default function ApplySection() {
  const uid = useId();
  const [role, setRole] = useState(GENERAL_ROLE_ID);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Same rules the server enforces, so obvious mistakes don't need a round trip. */
  const checkFile = (candidate: File): string | null => {
    const ext = (candidate.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return "Please attach a PDF, DOC or DOCX file.";
    if (candidate.size > MAX_BYTES) return `That file is over ${F.maxMb} MB.`;
    return null;
  };

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    const problem = checkFile(candidate);
    setFileError(problem);
    setFile(problem ? null : candidate);
  };

  const applyTo = (id: string) => {
    setRole(id);
    setStatus({ kind: "idle" });
    document.getElementById("apply")?.scrollIntoView({ block: "start" });
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setFileError("Please attach your CV.");
      return;
    }
    setStatus({ kind: "sending" });

    const data = new FormData(event.currentTarget);
    data.set("cv", file);

    try {
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.ok) {
        setStatus({ kind: "error", message: body?.error ?? F.errorGeneric });
        return;
      }
      setStatus({ kind: "sent", reference: body.reference });
      formRef.current?.reset();
      setFile(null);
      setRole(GENERAL_ROLE_ID);
    } catch {
      setStatus({ kind: "error", message: F.errorGeneric });
    }
  }

  return (
    <>
      {/* ---------------------------- Open roles ---------------------------- */}
      <section id="roles" className="scroll-mt-[100px] bg-cloud py-16 lg:py-24">
        <div className="shell">
          <h2 className="type-section text-carbon">{CAREERS.rolesTitle}</h2>
          <p className="type-lede mt-4 max-w-2xl">{CAREERS.rolesNote}</p>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((r) => (
              <li key={r.id} className="flex flex-col bg-white p-8">
                <p className="eyebrow text-stone">{r.team}</p>
                <h3 className="type-card mt-3 text-carbon">{r.title}</h3>
                <p className="mt-2 text-[14px] text-stone">
                  {r.location} · {r.type}
                </p>
                <p className="type-body mt-4">{r.summary}</p>
                <button
                  type="button"
                  onClick={() => applyTo(r.id)}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-carbon hover:text-white"
                >
                  Apply for this role
                  <Arrow />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------ Apply ------------------------------- */}
      <section id="apply" className="scroll-mt-[100px] bg-white py-16 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="type-section text-carbon">{F.title}</h2>
            <p className="type-lede mt-4">{F.intro}</p>
          </div>

          <div className="lg:col-span-7">
            {status.kind === "sent" ? (
              <div
                role="status"
                className="border border-spring-green bg-cloud p-8"
              >
                <h3 className="type-card text-carbon">{F.successTitle}</h3>
                <p className="type-body mt-3">{F.successBody}</p>
                <p className="mt-4 text-[14px] text-stone">
                  Reference: <span className="font-mono">{status.reference}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStatus({ kind: "idle" })}
                  className="mt-6 text-[15px] underline underline-offset-4"
                >
                  Send another application
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-name`} className="block text-[14px] text-stone">
                      Full name *
                    </label>
                    <input
                      id={`${uid}-name`}
                      name="name"
                      required
                      autoComplete="name"
                      className={cx(fieldClass, "mt-2")}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-email`} className="block text-[14px] text-stone">
                      Email *
                    </label>
                    <input
                      id={`${uid}-email`}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={cx(fieldClass, "mt-2")}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-phone`} className="block text-[14px] text-stone">
                      Phone
                    </label>
                    <input
                      id={`${uid}-phone`}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={cx(fieldClass, "mt-2")}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-location`} className="block text-[14px] text-stone">
                      Current location
                    </label>
                    <input
                      id={`${uid}-location`}
                      name="location"
                      autoComplete="address-level2"
                      className={cx(fieldClass, "mt-2")}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-experience`} className="block text-[14px] text-stone">
                      Years of experience
                    </label>
                    <input
                      id={`${uid}-experience`}
                      name="experience"
                      inputMode="numeric"
                      className={cx(fieldClass, "mt-2")}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-role`} className="block text-[14px] text-stone">
                      Role
                    </label>
                    <select
                      id={`${uid}-role`}
                      name="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={cx(fieldClass, "mt-2")}
                    >
                      <option value={GENERAL_ROLE_ID}>{F.generalRoleLabel}</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Drop zone. A label wrapping the real input keeps click, keyboard
                    and drag-and-drop all working without re-implementing any of them. */}
                <div>
                  <span className="block text-[14px] text-stone">CV *</span>
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      accept(e.dataTransfer.files?.[0]);
                    }}
                    className={cx(
                      "mt-2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed px-6 py-10 text-center transition-colors focus-within:border-carbon",
                      dragging ? "border-carbon bg-cloud" : "border-line bg-cloud/60",
                      fileError && "border-flame"
                    )}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      name="cv"
                      accept={F.accept}
                      aria-describedby={`${uid}-cv-help${fileError ? ` ${uid}-cv-error` : ""}`}
                      onChange={(e) => accept(e.target.files?.[0])}
                      className="sr-only"
                    />
                    {file ? (
                      <>
                        <span className="text-[15px] text-carbon">{file.name}</span>
                        <span className="text-[13px] text-stone">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[15px] text-carbon">{F.dropHint}</span>
                        <span id={`${uid}-cv-help`} className="text-[13px] text-stone">
                          {F.dropMeta}
                        </span>
                      </>
                    )}
                  </label>

                  {file && (
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileError(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="mt-2 text-[14px] underline underline-offset-4"
                    >
                      Remove file
                    </button>
                  )}
                  {fileError && (
                    <p id={`${uid}-cv-error`} className="mt-2 text-[14px] text-flame">
                      {fileError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={`${uid}-note`} className="block text-[14px] text-stone">
                    Anything you’d like to add
                  </label>
                  <textarea
                    id={`${uid}-note`}
                    name="note"
                    rows={4}
                    className={cx(fieldClass, "mt-2 resize-y")}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={status.kind === "sending"}
                    className="inline-flex items-center gap-2 rounded-pill bg-spring-green px-6 py-3 text-[15px] leading-none font-medium text-deep-forest transition-colors hover:bg-carbon hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status.kind === "sending" ? F.submittingLabel : F.submitLabel}
                    <Arrow />
                  </button>
                  <p aria-live="polite" className="text-[14px] text-flame">
                    {status.kind === "error" ? status.message : ""}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
