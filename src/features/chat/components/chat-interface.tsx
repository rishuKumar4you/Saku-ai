"use client";

// @ts-ignore react types are available at build time
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeSection } from "./welcome-section";

type ChatMessage = { id: string; content: string; isUser: boolean; timestamp: Date };
type GmailCard = { id: string; subject: string; sender: string; date: string; snippet: string; threadId?: string };

export const ChatInterface = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const [sources, setSources] = useState<{ emails: boolean; calendar: boolean; files: boolean }>({ emails: false, calendar: false, files: false });
    const [convId, setConvId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [gmailCards, setGmailCards] = useState<GmailCard[]>([]);
    const [connectors, setConnectors] = useState<Array<{ key: string; name: string; connected: boolean }>>([]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        
        const newMessage = {
            id: Date.now().toString(),
            content: content.trim(),
            isUser: true,
            timestamp: new Date(),
        };
        
        setMessages((prev: ChatMessage[]) => [...prev, newMessage]);
        setIsWelcomeVisible(false);
        if (!convId) {
            try {
                const form = new FormData();
                form.set("userId", "default");
                const resp = await fetch("/api/conversations", { method: "POST", body: form });
                const json = await resp.json();
                if (resp.ok && json?.id) setConvId(String(json.id));
            } catch {}
        }
        try {
            await fetchFinalAnswer(content.trim());
        } catch (err: any) {
            notifyError(err?.message || "Failed to stream response");
        }
    };

    async function fetchFinalAnswer(prompt: string) {
        if (isStreaming) return;
        setIsStreaming(true);
        const controller = new AbortController();
        abortRef.current = controller;

        // Create placeholder assistant message to stream into
        const assistantId = `assistant-${Date.now()}`;
        const createdAt = new Date();
        setMessages((prev: ChatMessage[]) => [
            ...prev,
            { id: assistantId, content: "", isUser: false, timestamp: createdAt },
        ]);

        try {
            let augmented = prompt;
            // Optionally blend Gmail/Calendar snippets
            try {
                const snippets: string[] = [];
                // Remove redundant reconnect banner: rely on Settings status only
                if (sources.emails) {
                    const r = await fetch(`/api/integrations/gmail?max_results=5`);
                    const j = await r.json();
                    const msgs = Array.isArray(j?.messages) ? j.messages : [];
                    for (const m of msgs.slice(0, 3)) {
                        if (typeof m?.snippet === 'string') snippets.push(`Email: ${m.snippet}`);
                    }
                }
                if (sources.calendar) {
                    const r = await fetch(`/api/integrations/calendar?max_results=5`);
                    const j = await r.json();
                    const evs = Array.isArray(j?.events) ? j.events : [];
                    for (const e of evs.slice(0, 3)) {
                        const line = `${e?.summary || 'Event'} on ${e?.start || ''}`.trim();
                        snippets.push(`Calendar: ${line}`);
                    }
                }
                if (sources.files) {
                    try {
                        const r = await fetch(`/api/integrations/drive?max_results=5`);
                        const j = await r.json();
                        const files = Array.isArray(j?.files) ? j.files : [];
                        for (const f of files.slice(0, 3)) {
                            const line = `${f?.name || 'File'} • ${f?.mimeType || ''}`.trim();
                            snippets.push(`Drive: ${line}`);
                        }
                    } catch {}
                }
                if (snippets.length) {
                    augmented = `${prompt}\n\nReference Snippets:\n${snippets.join('\n')}`;
                }
            } catch {}

            const qp = new URLSearchParams({ prompt: augmented });
            // hint to backend for RAG/connector usage
            if (sources.files) qp.set("docIds", "*");
            if (convId) qp.set("convId", convId);
            const resp = await fetch(`/api/chat/stream?${qp.toString()}`, {
                headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" },
                signal: controller.signal,
            });

            if (!resp.ok || !resp.body) throw new Error("Backend unavailable");

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let idx: number;
                while ((idx = buffer.indexOf("\n\n")) !== -1) {
                    const event = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    const dataLine = event.split("\n").find(l => l.startsWith("data:"));
                    if (!dataLine) continue;
                    const payload = dataLine.slice(5).trim();
                    try {
                        const parsed = JSON.parse(payload as string);
                        if (parsed?.type === "token") {
                            const token = String(parsed?.value ?? "");
                            setMessages((prev: ChatMessage[]) => prev.map((m: ChatMessage) => (
                                m.id === assistantId ? { ...m, content: m.content + token } : m
                            )));
                        } else if (parsed?.type === "done") {
                            // stream complete
                            break;
                        }
                    } catch {
                        // ignore non-JSON lines
                    }
                }
            }

            // Ensure convId is set after first save
            if (convId === null) {
                try {
                    const res = await fetch('/api/conversations');
                    const data = await res.json();
                    const last = Array.isArray(data?.conversations) ? data.conversations.slice(-1)[0] : null;
                    if (last?.id) setConvId(String(last.id));
                } catch {}
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                notifyError(err?.message || "Failed to stream response");
            }
        } finally {
            setIsStreaming(false);
            abortRef.current = null;
        }
    }

    useEffect(() => {
        return () => {
            // Cleanup ongoing stream on unmount
            abortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        // hydrate from URL convId if present
        const cid = searchParams?.get("convId");
        if (cid) setConvId(cid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    async function refreshGmailCards() {
        try {
            const resp = await fetch(`/api/integrations/gmail?max_results=5`);
            const json = await resp.json();
            const messages: any[] = Array.isArray(json?.messages) ? json.messages : [];
            setGmailCards(messages.map(m => ({
                id: String(m.id),
                subject: String(m.subject || "(No Subject)"),
                sender: String(m.sender || "Unknown"),
                date: String(m.date || ""),
                snippet: String(m.snippet || ""),
                threadId: m.threadId ? String(m.threadId) : undefined,
            })));
        } catch {
            setGmailCards([]);
        }
    }

    useEffect(() => {
        if (sources.emails) void refreshGmailCards(); else setGmailCards([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sources.emails]);

    async function ensureGmailConnected() {
        try {
            const r = await fetch('/api/connectors');
            const j = await r.json();
            const items: any[] = Array.isArray(j?.connectors) ? j.connectors : [];
            setConnectors(items);
            const gmail = items.find((x:any) => x.key === 'gmail');
            return !!gmail?.connected;
        } catch { return false; }
    }

    async function connectGmail() {
        try {
            const r = await fetch('/api/connectors/gmail/auth-url');
            const j = await r.json();
            if (j?.url) window.location.href = j.url;
        } catch {}
    }

    function notifyError(message: string) {
        try {
            const anyWin = window as unknown as { toast?: { error?: (m: string) => void } };
            if (anyWin.toast?.error) anyWin.toast.error(message); else console.error(message);
        } catch {
            console.error(message);
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
                {sources.emails && gmailCards.length > 0 && (
                    <div className="px-3 sm:px-6 py-3 space-y-3 max-w-4xl mx-auto">
                        <div className="text-xs text-muted-foreground">View Email Details ({gmailCards.length})</div>
                        {gmailCards.map((card: GmailCard) => (
                            <div key={card.id} className="border rounded p-3 bg-background">
                                <div className="text-sm font-medium">{card.subject}</div>
                                <div className="text-xs text-muted-foreground">{card.sender} • {card.date}</div>
                                <div className="text-sm mt-2">{card.snippet}</div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button className="text-xs border rounded px-2 py-1" onClick={async () => {
                                        // quick prompt-based reply
                                        const to = window.prompt('Reply to (email):', card.sender.replace(/.*<([^>]+)>.*/, '$1')) || '';
                                        const subject = `Re: ${card.subject}`;
                                        const body = window.prompt('Message body:', 'Thanks for the update!') || '';
                                        if (!to) return;
                                        await fetch('/api/integrations/gmail/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, body, threadId: card.threadId }) });
                                    }}>Reply</button>
                                    <button className="text-xs border rounded px-2 py-1" onClick={async () => {
                                        const to = window.prompt('Draft to (email):', card.sender.replace(/.*<([^>]+)>.*/, '$1')) || '';
                                        const subject = `Re: ${card.subject}`;
                                        const body = window.prompt('Draft body:', '') || '';
                                        if (!to) return;
                                        await fetch('/api/integrations/gmail/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to, subject, body, threadId: card.threadId }) });
                                    }}>Save Draft</button>
                                    <button className="text-xs border rounded px-2 py-1" onClick={() => { try { alert('Edit manually (placeholder)'); } catch {} }}>Edit Manually</button>
                                    <a className="text-xs border rounded px-2 py-1" href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(card.subject)}`} target="_blank" rel="noreferrer">View in Gmail</a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {sources.emails && gmailCards.length === 0 && (
                    <div className="px-3 sm:px-6 py-3 max-w-4xl mx-auto">
                        <div className="border rounded p-4 bg-background flex items-center justify-between">
                            <div>
                                <div className="font-medium">Connect Gmail</div>
                                <div className="text-sm text-muted-foreground">Authorize Gmail to fetch messages and send replies.</div>
                            </div>
                            <button className="text-sm border rounded px-3 py-1" onClick={connectGmail}>Connect</button>
                        </div>
                    </div>
                )}
                {isWelcomeVisible && messages.length === 0 ? (
                    <WelcomeSection onStartChat={handleSendMessage} />
                ) : (
                    <ChatMessages messages={messages} />
                )}
            </div>
            <ChatInput onSendMessage={handleSendMessage} onSourcesChange={setSources} />
        </div>
    );
};
