"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeSection } from "./welcome-section";

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Array<{
        id: string;
        content: string;
        isUser: boolean;
        timestamp: Date;
    }>>([]);
    
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const [sources, setSources] = useState<{ emails: boolean; calendar: boolean; files: boolean }>({ emails: false, calendar: false, files: false });
    const [convId, setConvId] = useState<string | null>(null);
    const searchParams = useSearchParams();

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        
        const newMessage = {
            id: Date.now().toString(),
            content: content.trim(),
            isUser: true,
            timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
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
            toast.error(err?.message || "Failed to stream response");
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
        setMessages(prev => [
            ...prev,
            { id: assistantId, content: "", isUser: false, timestamp: createdAt },
        ]);

        try {
            let augmented = prompt;
            // Optionally blend Gmail/Calendar snippets
            try {
                const snippets: string[] = [];
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
                            setMessages(prev => prev.map(m => (
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

            // If it's a new conversation and we have a first user message, set the title to that
            if (convId === null && newMessage.content) {
                try {
                    const res = await fetch('/api/conversations');
                    const data = await res.json();
                    const last = Array.isArray(data?.conversations) ? data.conversations.slice(-1)[0] : null;
                    if (last?.id) {
                        setConvId(String(last.id));
                    }
                } catch {}
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                toast.error(err?.message || "Failed to stream response");
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

    return (
        <div className="flex flex-col h-full bg-background">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
                {isWelcomeVisible && messages.length === 0 ? (
                    <WelcomeSection onStartChat={handleSendMessage} />
                ) : (
                    <ChatMessages messages={messages} />
                )}
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
};
