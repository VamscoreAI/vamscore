"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/components/ui";
import { windowState } from "@/lib/whatsapp/window";

/**
 * The staff WhatsApp inbox.
 *
 * **Polling, not sockets.** Vercel functions are short-lived and cannot hold a
 * connection open; at this volume a 4-second poll while the tab is visible is
 * indistinguishable from push, and it backs off to 20 seconds when the tab is
 * hidden so an inbox left open overnight costs almost nothing.
 *
 * **The reply window** comes from `windowState` — the same function the send
 * API uses to refuse — so the composer can never offer to send something the
 * server will reject.
 */

type Mode = "bot" | "human";
type Conversation = {
  id: string;
  name: string | null;
  waId: string;
  status: "open" | "resolved";
  mode: Mode;
  unreadCount: number;
  lastMessageAt: string;
  lastInboundAt: string | null;
  preview: string | null;
  previewType: string | null;
};
type Message = {
  id: string;
  direction: "in" | "out";
  author: "customer" | "bot" | "staff" | "echo";
  type: string;
  body: string | null;
  status: "received" | "sent" | "delivered" | "read" | "failed";
  error: string | null;
  createdAt: string;
};
type Lead = { id: string; name: string; company: string | null; need: string; email: string | null; createdAt: string; waId?: string };
type Callback = { id: string; name: string; preferredTimeText: string; topic: string; status: "requested" | "done"; createdAt: string; waId?: string };
type Thread = {
  conversation: { id: string; name: string | null; waId: string; status: "open" | "resolved"; mode: Mode; lastInboundAt: string | null };
  messages: Message[];
  leads: Lead[];
  callbacks: Callback[];
};

const TITLE = "WhatsApp inbox — Vamscore";

/** Runs `fn` now and then on a visibility-aware interval. */
function usePoll(fn: () => Promise<void>, visibleMs = 4000, hiddenMs = 20000) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const tick = async () => {
      try {
        await ref.current();
      } finally {
        if (!stopped) timer = setTimeout(tick, document.hidden ? hiddenMs : visibleMs);
      }
    };
    void tick();
    const onVisible = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        void tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [visibleMs, hiddenMs]);
}

const who = (c: { name: string | null; waId: string }) => c.name ?? `+${c.waId}`;

function when(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return d.toLocaleString("en-IN", sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function timeLeft(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const AUTHOR_LABEL: Record<Message["author"], string> = {
  customer: "Customer",
  bot: "Assistant",
  staff: "Staff",
  echo: "Phone app",
};

function Ticks({ m }: { m: Message }) {
  if (m.direction !== "out") return null;
  if (m.status === "failed") {
    return <span title={m.error ?? "Not delivered"} className="text-flame-2">Not sent</span>;
  }
  return (
    <span className={m.status === "read" ? "text-spring-green" : "text-white/50"}>
      {m.status === "sent" ? "✓" : "✓✓"}
    </span>
  );
}

async function json<T>(res: Response): Promise<T & { error?: string }> {
  return res.json().catch(() => ({}) as T & { error?: string });
}

export default function Inbox() {
  const [list, setList] = useState<Conversation[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [tab, setTab] = useState<"chats" | "leads">("chats");
  const [pipeline, setPipeline] = useState<{ leads: Lead[]; callbacks: Callback[] } | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUnread = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/whatsapp/conversations", { cache: "no-store" });
    const data = await json<{ conversations: Conversation[]; totalUnread: number }>(res);
    if (!res.ok) {
      setError(data.error ?? "Could not load conversations.");
      return;
    }
    setList(data.conversations);
    // Tab badge and an optional desktop notification, only when something new
    // arrives while nobody is looking.
    const total = data.totalUnread;
    if (document.hidden && total > lastUnread.current) {
      document.title = `(${total}) ${TITLE}`;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("New WhatsApp message", { body: "Open the inbox to see it." });
      }
    } else if (!document.hidden) {
      document.title = TITLE;
    }
    lastUnread.current = total;
  }, []);

  // The chat most recently opened. Set in the click handler, so a slow response
  // for a chat the user has already left is recognised and dropped instead of
  // replacing the one on screen (click A, then B: A's reply can land last).
  const selectedRef = useRef<string | null>(null);

  const fetchThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/whatsapp/conversations/${id}`, { cache: "no-store" });
    if (!res.ok || selectedRef.current !== id) return;
    const data = await json<Thread>(res);
    if (selectedRef.current === id) setThread(data);
  }, []);

  const loadThread = useCallback(async () => {
    if (selected) await fetchThread(selected);
  }, [selected, fetchThread]);

  const fetchPipeline = useCallback(async () => {
    const res = await fetch("/api/whatsapp/leads", { cache: "no-store" });
    if (res.ok) setPipeline(await json<{ leads: Lead[]; callbacks: Callback[] }>(res));
  }, []);

  const loadPipeline = useCallback(async () => {
    if (tab === "leads") await fetchPipeline();
  }, [tab, fetchPipeline]);

  usePoll(loadList);
  usePoll(loadThread);
  usePoll(loadPipeline, 15000, 60000);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length]);

  // Opening a chat loads it at once and clears its unread count. That happens
  // here, in the click handler, not in an effect keyed on `selected`: it is a
  // response to the click, and an effect that sets state on every selection
  // change is the cascading render React's rules warn against.
  function open(id: string) {
    selectedRef.current = id;
    setThread(null);
    setError(null);
    setDraft("");
    setSelected(id);
    void fetchThread(id);
    void fetch(`/api/whatsapp/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read" }),
    });
  }

  function chooseTab(t: "chats" | "leads") {
    setTab(t);
    if (t === "leads") void fetchPipeline();
  }

  async function act(action: "takeover" | "handback" | "resolve" | "reopen") {
    if (!selected) return;
    const res = await fetch(`/api/whatsapp/conversations/${selected}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) setError((await json(res)).error ?? "That did not work.");
    await Promise.all([loadThread(), loadList()]);
  }

  async function send() {
    if (!selected || !draft.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/whatsapp/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected, body: draft }),
    });
    const data = await json(res);
    if (res.ok) setDraft("");
    else setError(data.error ?? "Could not send.");
    setSending(false);
    await Promise.all([loadThread(), loadList()]);
  }

  async function markCallback(id: string, status: "done" | "requested") {
    await fetch("/api/whatsapp/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callbackId: id, status }),
    });
    await loadPipeline();
  }

  const conv = thread?.conversation;
  const win = conv ? windowState(conv.lastInboundAt) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* ---- Left: conversations / leads ---- */}
      <aside className="rounded-lg border border-white/10">
        <div className="flex border-b border-white/10 text-[14px]" role="tablist">
          {(["chats", "leads"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => chooseTab(t)}
              className={cx(
                "flex-1 px-4 py-3 transition-colors",
                tab === t ? "text-white shadow-[inset_0_-2px_0_var(--color-spring-green)]" : "text-white/60 hover:text-white",
              )}
            >
              {t === "chats" ? "Chats" : "Leads & call-backs"}
            </button>
          ))}
        </div>

        {tab === "chats" && (
          <ul className="max-h-[65dvh] overflow-y-auto">
            {list === null && <li className="p-4 text-white/60">Loading…</li>}
            {list?.length === 0 && (
              <li className="p-4 text-white/60">No conversations yet.</li>
            )}
            {list?.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => open(c.id)}
                  className={cx(
                    "block w-full border-b border-white/5 px-4 py-3 text-left transition-colors",
                    selected === c.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{who(c)}</span>
                    <span className="shrink-0 text-[12px] text-white/50">{when(c.lastMessageAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] text-white/60">
                      {c.previewType && c.previewType !== "text" ? `[${c.preview ?? "file"}]` : c.preview ?? ""}
                    </span>
                    {c.unreadCount > 0 && (
                      <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-spring-green px-1.5 text-[12px] font-medium text-deep-forest">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex gap-2 text-[11px] uppercase tracking-wide">
                    <span className={c.mode === "bot" ? "text-spring-green" : "text-flame-2"}>
                      {c.mode === "bot" ? "Assistant" : "Staff"}
                    </span>
                    {c.status === "resolved" && <span className="text-white/40">Resolved</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "leads" && (
          <div className="max-h-[65dvh] space-y-6 overflow-y-auto p-4 text-[14px]">
            {pipeline === null && <p className="text-white/60">Loading…</p>}
            {pipeline && (
              <>
                <section>
                  <h2 className="mb-2 text-[12px] uppercase tracking-wide text-white/50">Call-backs</h2>
                  {pipeline.callbacks.length === 0 && <p className="text-white/50">None yet.</p>}
                  <ul className="space-y-3">
                    {pipeline.callbacks.map((c) => (
                      <li key={c.id} className={cx("rounded border border-white/10 p-3", c.status === "done" && "opacity-50")}>
                        <p className="font-medium">{c.name} · +{c.waId}</p>
                        <p className="text-white/70">{c.preferredTimeText} — {c.topic}</p>
                        <button
                          onClick={() => markCallback(c.id, c.status === "done" ? "requested" : "done")}
                          className="mt-2 text-spring-green hover:text-white"
                        >
                          {c.status === "done" ? "Mark not done" : "Mark done"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2 className="mb-2 text-[12px] uppercase tracking-wide text-white/50">Leads</h2>
                  {pipeline.leads.length === 0 && <p className="text-white/50">None yet.</p>}
                  <ul className="space-y-3">
                    {pipeline.leads.map((l) => (
                      <li key={l.id} className="rounded border border-white/10 p-3">
                        <p className="font-medium">
                          {l.name}{l.company ? ` · ${l.company}` : ""}
                        </p>
                        <p className="text-white/70">{l.need}</p>
                        <p className="mt-1 text-white/50">+{l.waId}{l.email ? ` · ${l.email}` : ""}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        )}
      </aside>

      {/* ---- Right: the thread ---- */}
      <section className="flex min-h-[65dvh] flex-col rounded-lg border border-white/10">
        {!selected && (
          <p className="m-auto p-8 text-white/60">Choose a conversation.</p>
        )}

        {selected && !thread && <p className="m-auto p-8 text-white/60">Loading…</p>}

        {conv && thread && (
          <>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
              <div>
                <p className="font-medium">{who(conv)}</p>
                <p className="text-[13px] text-white/50">+{conv.waId}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[14px]">
                {conv.mode === "bot" ? (
                  <button onClick={() => act("takeover")} className="rounded-pill border border-white/25 px-4 py-1.5 hover:border-white">
                    Take over
                  </button>
                ) : (
                  <button onClick={() => act("handback")} className="rounded-pill border border-white/25 px-4 py-1.5 hover:border-white">
                    Hand back to assistant
                  </button>
                )}
                <button
                  onClick={() => act(conv.status === "open" ? "resolve" : "reopen")}
                  className="rounded-pill border border-white/25 px-4 py-1.5 hover:border-white"
                >
                  {conv.status === "open" ? "Resolve" : "Reopen"}
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: "55dvh" }}>
              {thread.messages.map((m) => {
                const mine = m.direction === "out";
                return (
                  <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cx(
                        "max-w-[78%] rounded-lg px-3.5 py-2.5",
                        mine ? "bg-white/[0.10]" : "border border-white/10",
                        m.author === "bot" && "border-l-2 border-l-spring-green",
                      )}
                    >
                      <p className="mb-1 text-[11px] uppercase tracking-wide text-white/50">
                        {AUTHOR_LABEL[m.author]}
                      </p>
                      <p className="whitespace-pre-wrap text-[15px] leading-6">
                        {m.type === "text" ? m.body : `[${m.body ?? "file"} — open WhatsApp to view]`}
                      </p>
                      <p className="mt-1 flex justify-end gap-2 text-[11px] text-white/50">
                        <span>{when(m.createdAt)}</span>
                        <Ticks m={m} />
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <footer className="border-t border-white/10 p-4">
              {win && !win.open ? (
                <p className="text-[14px] text-white/70">
                  The 24-hour reply window has closed. The customer needs to message again before you can reply.
                </p>
              ) : (
                <>
                  <div className="mb-2 flex justify-between text-[12px] text-white/50">
                    <span>
                      {conv.mode === "bot"
                        ? "Sending a reply takes this chat over from the assistant."
                        : "You have this chat. The assistant is paused."}
                    </span>
                    {win && <span>{timeLeft(win.msLeft)} left to reply</span>}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send();
                    }}
                    className="flex gap-2"
                  >
                    <label htmlFor="wa-reply" className="sr-only">Reply</label>
                    <textarea
                      id="wa-reply"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          void send();
                        }
                      }}
                      rows={2}
                      placeholder="Write a reply…  (Ctrl+Enter to send)"
                      className="min-h-11 flex-1 resize-y rounded border border-white/20 bg-white/[0.04] px-3 py-2 text-[15px] outline-none focus:border-spring-green"
                    />
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="self-end rounded-pill bg-spring-green px-5 py-2.5 font-medium text-deep-forest transition-colors hover:bg-white disabled:opacity-40"
                    >
                      {sending ? "Sending…" : "Send"}
                    </button>
                  </form>
                </>
              )}
              {error && <p role="alert" className="mt-2 text-[14px] text-flame-2">{error}</p>}
            </footer>

            {(thread.leads.length > 0 || thread.callbacks.length > 0) && (
              <div className="border-t border-white/10 px-5 py-3 text-[13px] text-white/70">
                {thread.leads.map((l) => (
                  <p key={l.id}>Lead: {l.name} — {l.need}</p>
                ))}
                {thread.callbacks.map((c) => (
                  <p key={c.id}>Call-back: {c.preferredTimeText} — {c.topic} ({c.status})</p>
                ))}
              </div>
            )}
          </>
        )}

        {!selected && typeof Notification !== "undefined" && Notification.permission === "default" && (
          <div className="border-t border-white/10 p-4 text-[14px]">
            <button onClick={() => void Notification.requestPermission()} className="text-spring-green hover:text-white">
              Turn on desktop notifications for new messages
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
