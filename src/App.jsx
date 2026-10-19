import { useEffect, useRef, useState } from "react";
import { Client } from "@gradio/client";
import ReactMarkdown from "react-markdown";
import "./App.css";

// Your Hugging Face Space (the "brain")
const SPACE = "ebuuu1412/mongolian-law-assistant";

const EXAMPLES = [
  "Хүнийг алсан бол ямар ял оногдуулах вэ?",
  "Ажил олгогч хөдөлмөрийн гэрээг ямар үндэслэлээр цуцалж болох вэ?",
  "Гэрлэлтээ цуцлуулахын тулд яах вэ?",
  "Эрүүгийн хуулийн 10.1 дүгээр зүйлд юу гэж заасан бэ?",
];

const STORAGE_KEY = "mn-law-chats";
const THEME_KEY = "mn-law-theme";
const STOPPED = "_Хариултыг зогсоосон._";
const MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";

// The Space may send the answer as plain text or wrapped in an object/list: always get the text out
function toText(x) {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return x.length ? toText(x[x.length - 1]) : "";
  if (x && typeof x === "object") return toText(x.content ?? x.text ?? "");
  return x == null ? "" : String(x);
}

// Short progress messages the backend sends before the answer starts ("🔎 Хууль хайж байна…")
const isStatus = (t) => t.length < 40 && (t.startsWith("🔎") || t.startsWith("✍️"));
const isError = (t) => t.startsWith("⚠️");

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const NO_MESSAGES = []; // one shared empty list, so effects that depend on messages don't re-run for nothing
const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

// Saved chats live in this browser only. An answer that was cut off by closing the page is marked as stopped.
function loadChats() {
  try {
    const chats = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(chats)) return [];
    return chats.map((c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.role === "assistant" && (!m.text || isStatus(m.text)) ? { ...m, text: STOPPED } : m
      ),
    }));
  } catch {
    return [];
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
}

// Sidebar history is grouped by when the chat was started. Chats saved before dates were kept go under "Өмнөх".
function groupChats(chats) {
  const day = 864e5;
  const today = new Date().setHours(0, 0, 0, 0);
  const groups = [["Өнөөдөр", []], ["Өчигдөр", []], ["Сүүлийн 7 хоног", []], ["Сүүлийн 30 хоног", []], ["Өмнөх", []]];
  for (const c of chats) {
    const t = c.createdAt ?? 0;
    const i = t >= today ? 0 : t >= today - day ? 1 : t >= today - 7 * day ? 2 : t >= today - 30 * day ? 3 : 4;
    groups[i][1].push(c);
  }
  return groups.filter(([, cs]) => cs.length);
}

// ---------- icons ----------
const Icon = ({ d, size = 20, width = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const Scales = (p) => (
  <Icon {...p} d={<>
    <path d="M12 3v18M7 21h10M5 7h14" />
    <path d="M5 7l-3 7a3.2 3.2 0 0 0 6 0L5 7zM19 7l-3 7a3.2 3.2 0 0 0 6 0l-3-7z" />
  </>} />
);
const NewChat = (p) => <Icon {...p} d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>} />;
const PanelIcon = (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>} />;
const MenuIcon = (p) => <Icon {...p} d={<path d="M4 7h16M4 12h16M4 17h10" />} />;
const ArrowUp = (p) => <Icon {...p} width={2.2} d={<path d="M12 19V5M5 12l7-7 7 7" />} />;
const ArrowDown = (p) => <Icon {...p} width={2} d={<path d="M12 5v14M5 12l7 7 7-7" />} />;
const CopyIcon = (p) => <Icon {...p} d={<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>} />;
const CheckIcon = (p) => <Icon {...p} width={2} d={<path d="M5 12l5 5L20 7" />} />;
const TrashIcon = (p) => <Icon {...p} d={<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />} />;
const BookIcon = (p) => <Icon {...p} d={<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></>} />;
const SearchIcon = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>} />;
const RetryIcon = (p) => <Icon {...p} d={<><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>} />;
const EditIcon = (p) => <Icon {...p} d={<><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><path d="M17.5 3.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" /></>} />;
const SunIcon = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>} />;
const MoonIcon = (p) => <Icon {...p} d={<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />} />;
const MonitorIcon = (p) => <Icon {...p} d={<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>} />;

// ---------- markdown ----------
// Code blocks get a header bar with the language and a copy button
function CodeBlock({ children }) {
  const [done, setDone] = useState(false);
  const code = children?.props ?? {};
  const text = String(code.children ?? "").replace(/\n$/, "");
  const lang = /language-(\S+)/.exec(code.className || "")?.[1] ?? "текст";
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* clipboard not allowed */
    }
  }
  return (
    <div className="code">
      <div className="code-head">
        <span>{lang}</span>
        <button onClick={copy}>
          {done ? <CheckIcon size={14} /> : <CopyIcon size={14} />} {done ? "Хуулсан" : "Хуулах"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

const MD = {
  a: ({ href, title, children }) => <a href={href} title={title} target="_blank" rel="noreferrer">{children}</a>,
  pre: CodeBlock,
  table: ({ children }) => <div className="table-wrap"><table>{children}</table></div>,
};

export default function App() {
  const [chats, setChats] = useState(loadChats); // [{ id, title, createdAt, messages: [{ role, text }] }]
  const [activeId, setActiveId] = useState(null); // null = a fresh, empty chat
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState("fast"); // "fast" = quicker answers, "think" = more careful (the tested mode)
  const [sideOpen, setSideOpen] = useState(() => !isMobile());
  const [atBottom, setAtBottom] = useState(true);
  const [copied, setCopied] = useState(null);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(loadTheme); // "system" | "light" | "dark"
  const [undo, setUndo] = useState(null); // the last deleted chat, while it can still be restored
  const clientRef = useRef(null);
  const jobRef = useRef(null);
  const requestRef = useRef(0); // bumps on every question and on Stop, so a stale stream stops writing
  const threadRef = useRef(null);
  const atBottomRef = useRef(true);
  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const undoTimer = useRef(null);

  const active = chats.find((c) => c.id === activeId);
  const messages = active?.messages ?? NO_MESSAGES;

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? chats.filter((c) => c.title.toLowerCase().includes(needle) || c.messages.some((m) => m.text.toLowerCase().includes(needle)))
    : chats;

  // save chats in this browser
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* storage can be full or blocked; the app still works without it */
    }
  }, [chats]);

  // light / dark / follow the system (index.html applies the saved choice before the first paint)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* not saved; the choice still holds for this visit */
    }
  }, [theme]);

  // follow the answer as it streams, but only while the reader is at the bottom
  useEffect(() => {
    const el = threadRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // a seconds counter while waiting, so people know it's working
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  // grow the textarea with its content (up to the max-height set in CSS)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input, activeId]);

  // put the cursor in the composer when switching chats (not on phones: it would pop the keyboard)
  useEffect(() => {
    if (!isMobile()) inputRef.current?.focus();
  }, [activeId]);

  // stop the undo countdown if the app goes away
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  // Connect to the Space as soon as the page opens, so the first question doesn't wait for it
  useEffect(() => {
    getClient().catch(() => {}); // if it fails, ask() will try again
  }, []);

  // keyboard shortcuts: new chat, toggle sidebar, search chats, copy the last answer,
  // Shift+Esc focuses the composer, Esc stops an answer
  useEffect(() => {
    function onKey(e) {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && e.shiftKey && key === "o") {
        e.preventDefault();
        openChat(null);
      } else if (mod && e.shiftKey && key === "s") {
        e.preventDefault();
        setSideOpen((o) => !o);
      } else if (mod && key === "k") {
        e.preventDefault();
        setSideOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0); // after the sidebar has opened
      } else if (mod && e.shiftKey && key === "c") {
        const last = messages[messages.length - 1];
        if (last?.role === "assistant" && last.text && !busy) {
          e.preventDefault();
          copy(last.text, messages.length - 1);
        }
      } else if (e.key === "Escape" && e.shiftKey) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && busy) {
        stop();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function getClient() {
    // keep the connection "promise", so two calls at the same time share one connection
    // "status" events are needed to hear about errors; without them a failed run just goes quiet
    if (!clientRef.current) clientRef.current = Client.connect(SPACE, { events: ["data", "status"] });
    try {
      return await clientRef.current;
    } catch (err) {
      clientRef.current = null;
      throw err;
    }
  }

  const updateMessages = (id, fn) =>
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, messages: fn(c.messages) } : c)));

  function scrollToBottom() {
    const el = threadRef.current;
    atBottomRef.current = true;
    setAtBottom(true);
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }

  function onThreadScroll() {
    const el = threadRef.current;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = bottom;
    setAtBottom(bottom);
  }

  // retry = answer the last question again, replacing the previous answer
  async function ask(question, retry = false) {
    const q = question.trim();
    if (!q || busy) return;

    // The Space has no memory between questions. For a short follow-up
    // ("Тэгвэл хүүхэдтэй бол?") we send the previous question along with it.
    const earlier = retry ? messages.slice(0, -2) : messages;
    const lastQuestion = [...earlier].reverse().find((m) => m.role === "user")?.text;
    const sent = lastQuestion && q.split(/\s+/).length < 6 ? `${lastQuestion} ${q}` : q;

    let id = activeId;
    if (!id) {
      id = newId();
      setChats((cs) => [{ id, title: q.slice(0, 60), createdAt: Date.now(), messages: [] }, ...cs]);
      setActiveId(id);
    }

    const request = ++requestRef.current;
    if (!retry) setInput("");
    setBusy(true);
    setSeconds(0);
    atBottomRef.current = true;
    setAtBottom(true);
    updateMessages(id, (m) =>
      retry
        ? [...m.slice(0, -1), { role: "assistant", text: "" }]
        : [...m, { role: "user", text: q }, { role: "assistant", text: "" }]
    );
    const showAnswer = (text) => {
      if (requestRef.current !== request) return; // stopped, or a newer question took over
      updateMessages(id, (m) => [...m.slice(0, -1), { role: "assistant", text }]);
    };

    try {
      const client = await getClient();
      const job = client.submit("/chat", { message: sent, mode });
      jobRef.current = job;
      let answer = "";
      for await (const ev of job) {
        if (requestRef.current !== request) break;
        if (ev.type === "data") showAnswer((answer = toText(ev.data?.[0]))); // the answer grows as it streams
        if (ev.type === "status" && ev.stage === "error") throw new Error(String(ev.message || "error"));
      }
      // the stream ended without a real answer (only "🔎 searching…" or nothing)
      if (requestRef.current === request && (!answer || isStatus(answer))) throw new Error("empty answer");
    } catch (err) {
      console.error(err);
      clientRef.current = null; // reconnect next time
      showAnswer(
        /quota|limit/i.test(err.message)
          ? "⚠️ Үйлчилгээний хэрэглээний хязгаар түр хэтэрсэн байна. Хэсэг хугацааны дараа дахин оролдоно уу."
          : "⚠️ Уучлаарай, холбогдож чадсангүй. Хэсэг хугацааны дараа дахин оролдоно уу."
      );
    } finally {
      if (requestRef.current === request) {
        jobRef.current = null;
        setBusy(false);
      }
    }
  }

  function stop() {
    requestRef.current++; // the running stream ignores everything from now on
    try {
      jobRef.current?.cancel();
    } catch {
      /* the job may already be finished */
    }
    jobRef.current = null;
    setBusy(false);
    updateMessages(activeId, (m) => {
      const last = m[m.length - 1];
      return last?.role === "assistant" && (!last.text || isStatus(last.text))
        ? [...m.slice(0, -1), { role: "assistant", text: STOPPED }]
        : m;
    });
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault(); // Enter sends, Shift+Enter makes a new line
      ask(input);
    }
  }

  function openChat(id) {
    if (busy) stop();
    setActiveId(id);
    atBottomRef.current = true;
    setAtBottom(true);
    if (isMobile()) setSideOpen(false);
  }

  // deleting is instant, with a few seconds to undo it
  function deleteChat(id) {
    const index = chats.findIndex((c) => c.id === id);
    if (index < 0) return;
    if (id === activeId) openChat(null);
    setChats((cs) => cs.filter((c) => c.id !== id));
    setUndo({ chat: chats[index], index });
    clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  }

  function restoreChat() {
    const { chat, index } = undo;
    setChats((cs) => [...cs.slice(0, index), chat, ...cs.slice(index)]);
    setUndo(null);
    clearTimeout(undoTimer.current);
  }

  function editQuestion(text) {
    setInput(text);
    inputRef.current?.focus();
  }

  async function copy(text, i) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 2000);
    } catch {
      /* clipboard not allowed */
    }
  }

  const composer = (
    <div className="composer">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Хуулийн асуултаа бичнэ үү"
        rows={1}
        aria-label="Асуулт"
      />
      {busy ? (
        <button className="send stop" onClick={stop} aria-label="Зогсоох" data-tip="Зогсоох (Esc)">
          <span className="stop-square" />
        </button>
      ) : (
        <button className="send" onClick={() => ask(input)} disabled={!input.trim()}
                aria-label="Илгээх" data-tip="Илгээх (Enter)">
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );

  const lastQuestion = [...messages].reverse().find((m) => m.role === "user")?.text;

  return (
    <div className={`shell${sideOpen ? " side-open" : ""}`}>
      <aside className="sidebar" aria-label="Чатын түүх">
        <div className="side-top">
          <span className="brand"><Scales size={20} /> Хуулийн туслах</span>
          <button className="icon-btn" onClick={() => setSideOpen(false)}
                  aria-label="Хажуугийн самбарыг хаах" title={`Хаах (${MOD}⇧S)`}>
            <PanelIcon />
          </button>
        </div>
        <button className="side-row" onClick={() => openChat(null)}>
          <NewChat size={18} /> Шинэ чат
          <kbd>{MOD}⇧O</kbd>
        </button>
        <label className="side-search">
          <SearchIcon size={18} />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Чат хайх"
            aria-label="Чат хайх"
          />
          {!query && <kbd>{MOD}K</kbd>}
        </label>

        <nav className="history">
          {chats.length === 0 && <p className="side-empty">Асуултууд энд хадгалагдана</p>}
          {chats.length > 0 && shown.length === 0 && <p className="side-empty">Олдсонгүй</p>}
          {groupChats(shown).map(([label, group]) => (
            <section key={label}>
              <div className="side-label">{label}</div>
              {group.map((c) => (
                <div key={c.id} className={`history-row${c.id === activeId ? " active" : ""}`}>
                  <button className="history-title" onClick={() => openChat(c.id)} title={c.title}
                          aria-current={c.id === activeId ? "page" : undefined}>
                    {c.title}
                  </button>
                  <button className="history-del" onClick={() => deleteChat(c.id)}
                          aria-label="Устгах" title="Устгах">
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </section>
          ))}
        </nav>

        <div className="side-foot">
          <a className="source" href="https://legalinfo.mn" target="_blank" rel="noreferrer">
            <BookIcon size={18} />
            <span>
              Албан ёсны эх сурвалж
              <small>legalinfo.mn</small>
            </span>
          </a>
          <div className="themes" role="group" aria-label="Өнгөний горим">
            {[["system", MonitorIcon, "Систем"], ["light", SunIcon, "Цайвар"], ["dark", MoonIcon, "Бараан"]].map(
              ([value, Glyph, label]) => (
                <button key={value} className={theme === value ? "on" : ""} aria-pressed={theme === value}
                        onClick={() => setTheme(value)} aria-label={label} title={label}>
                  <Glyph size={16} />
                </button>
              )
            )}
          </div>
        </div>
      </aside>
      <div className="scrim" onClick={() => setSideOpen(false)} />

      <div className="main">
        <header className="topbar">
          <div className="topbar-side">
            {!sideOpen && (
              <>
                <button className="icon-btn" onClick={() => setSideOpen(true)}
                        aria-label="Хажуугийн самбарыг нээх" data-tip={`Түүх (${MOD}⇧S)`}>
                  <MenuIcon />
                </button>
                <button className="icon-btn" onClick={() => openChat(null)}
                        aria-label="Шинэ чат" data-tip={`Шинэ чат (${MOD}⇧O)`}>
                  <NewChat />
                </button>
              </>
            )}
          </div>
          <div className="modes" role="group" aria-label="Хариултын горим">
            <button className={mode === "fast" ? "on" : ""} aria-pressed={mode === "fast"}
                    onClick={() => setMode("fast")} disabled={busy}
                    data-tip="Шуурхай хариулт">Хурдан</button>
            <button className={mode === "think" ? "on" : ""} aria-pressed={mode === "think"}
                    onClick={() => setMode("think")} disabled={busy}
                    data-tip="Илүү нягт, бага зэрэг удаан">Нарийвчилсан</button>
          </div>
          <div className="topbar-side" />
        </header>

        {messages.length === 0 ? (
          <div className="empty">
            <h1>Хуулийн ямар асуулт байна?</h1>
            {composer}
            <div className="suggestions">
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => ask(ex)}>
                  <BookIcon size={18} />
                  <span>{ex}</span>
                </button>
              ))}
            </div>
            <p className="disclaimer">
              Монгол Улсын хүчин төгөлдөр хуулиудаас хайж, зүйл заалтыг эш татан хариулна.
            </p>
          </div>
        ) : (
          <>
            <div className="thread" ref={threadRef} onScroll={onThreadScroll}>
              <div className="column">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="turn user">
                      <div className="bubble">{m.text}</div>
                      <div className="actions">
                        <button className="icon-btn small" onClick={() => copy(m.text, i)}
                                aria-label="Хуулах" data-tip={copied === i ? "Хуулсан" : "Хуулах"}>
                          {copied === i ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                        </button>
                        <button className="icon-btn small" onClick={() => editQuestion(m.text)}
                                aria-label="Засах" data-tip="Засаад дахин асуух">
                          <EditIcon size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className={`turn assistant${i === messages.length - 1 ? " last" : ""}`}>
                      {!m.text || isStatus(m.text) ? (
                        <span className="thinking">
                          <span className="shimmer">{m.text || "Холбогдож байна…"}</span>
                          <span className="secs">{seconds} сек</span>
                        </span>
                      ) : (
                        <>
                          <div className={`prose${isError(m.text) ? " error" : ""}`}>
                            <ReactMarkdown components={MD}>{m.text}</ReactMarkdown>
                          </div>
                          {!(busy && i === messages.length - 1) && (
                            <div className="actions">
                              <button className="icon-btn small" onClick={() => copy(m.text, i)}
                                      aria-label="Хуулах" data-tip={copied === i ? "Хуулсан" : "Хуулах"}>
                                {copied === i ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                              </button>
                              {i === messages.length - 1 && lastQuestion && (
                                <button className="icon-btn small" onClick={() => ask(lastQuestion, true)}
                                        aria-label="Дахин хариулах" data-tip="Дахин хариулах">
                                  <RetryIcon size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="dock">
              {!atBottom && (
                <button className="to-bottom" onClick={scrollToBottom} aria-label="Доош гүйлгэх">
                  <ArrowDown size={18} />
                </button>
              )}
              {composer}
              <p className="disclaimer">
                Энэ нь хуулийн зөвлөгөө биш. Чухал асуудлаар{" "}
                <a href="https://legalinfo.mn" target="_blank" rel="noreferrer">legalinfo.mn</a>{" "}
                эсвэл хуульчаас лавлана уу.
              </p>
            </div>
          </>
        )}
      </div>

      {/* screen readers hear the answer once it is finished, not token by token */}
      <div className="sr-only" aria-live="polite">
        {!busy && messages[messages.length - 1]?.role === "assistant" ? messages[messages.length - 1].text : ""}
      </div>

      {undo && (
        <div className="toast" role="status">
          Чат устгагдлаа
          <button onClick={restoreChat}>Буцаах</button>
        </div>
      )}
    </div>
  );
}
