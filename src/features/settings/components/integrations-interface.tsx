"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Connector = { key: string; name: string; connected: boolean };

export const IntegrationsInterface = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const [busy, setBusy] = useState<Record<string, boolean>>({});
    const googleServices = useMemo(() => [
        { key: "gmail", name: "Gmail", icon: "📧" },
        { key: "calendar", name: "Google Calendar", icon: "📅" },
        { key: "drive", name: "Google Drive", icon: "💾" },
    ], []);

    async function refresh() {
        try {
            const r = await fetch("/api/connectors", { cache: "no-store" });
            const j = await r.json();
            setConnectors(Array.isArray(j?.connectors) ? j.connectors : []);
        } catch {
            setConnectors([]);
        }
    }

    useEffect(() => { void refresh(); }, []);

    async function connect(serviceKey: string) {
        if (busy[serviceKey]) return;
        setBusy((b) => ({ ...b, [serviceKey]: true }));
        try {
            const r = await fetch(`/api/connectors/${encodeURIComponent(serviceKey)}/auth-url`, { cache: "no-store" });
            if (!r.ok) {
                const t = await r.text();
                console.error("Connect failed:", t);
                alert("Failed to start OAuth. Check backend URL and redirect URI.");
                return;
            }
            const j = await r.json();
            if (j?.url) {
                // Use assign to ensure same-tab navigation
                window.location.assign(j.url as string);
            } else {
                alert("OAuth URL not returned by backend.");
            }
        } catch (e) {
            console.error(e);
            alert("Network error starting OAuth.");
        } finally {
            setBusy((b) => ({ ...b, [serviceKey]: false }));
        }
    }

    async function disconnect(serviceKey: string) {
        if (busy[serviceKey]) return;
        setBusy((b) => ({ ...b, [serviceKey]: true }));
        try {
            const resp = await fetch("/api/integrations/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_type: serviceKey }),
            });
            if (!resp.ok) {
                const t = await resp.text();
                console.error('Disconnect failed', t);
                alert("Failed to disconnect. See console for details.");
            }
            await refresh();
        } catch (e) { console.error(e); alert("Network error disconnecting."); }
        finally { setBusy((b) => ({ ...b, [serviceKey]: false })); }
    }

    const filtered = useMemo(() => googleServices.filter(it => it.name.toLowerCase().includes(searchQuery.toLowerCase())), [googleServices, searchQuery]);

    function isConnected(key: string) {
        return !!connectors.find(c => c.key === key && c.connected);
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
                <p className="text-gray-600 mt-2">Connect Google services to enable email, files, and calendar.</p>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input placeholder="Search integrations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(svc => (
                    <div key={svc.key} className="flex items-center justify-between p-4 border rounded">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">{svc.icon}</div>
                            <div>
                                <div className="font-medium">{svc.name}</div>
                                <div className="text-sm text-muted-foreground">{isConnected(svc.key) ? "Connected" : "Disconnected"}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isConnected(svc.key) ? (
                                <Button variant="outline" onClick={() => disconnect(svc.key)} disabled={!!busy[svc.key]}>
                                    {busy[svc.key] ? "Disconnecting…" : "Disconnect"}
                                </Button>
                            ) : (
                                <Button onClick={() => connect(svc.key)} disabled={!!busy[svc.key]}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {busy[svc.key] ? "Connecting…" : "Connect"}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
