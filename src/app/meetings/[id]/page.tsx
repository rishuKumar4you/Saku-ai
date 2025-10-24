"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function MeetingDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [meeting, setMeeting] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [agendaText, setAgendaText] = useState("");
  const [actionText, setActionText] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "agenda" | "actions">("notes");
  const videoRef = useRef<HTMLVideoElement>(null);

  function fmtTime(sec?: number) {
    if (typeof sec !== "number" || isNaN(sec)) return "";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  function seekTo(sec?: number) {
    if (!videoRef.current || typeof sec !== "number") return;
    videoRef.current.currentTime = Math.max(0, sec);
    try { videoRef.current.play?.(); } catch {}
  }

  async function refreshAll() {
    try {
      const [m, i, p] = await Promise.all([
        fetch(`/api/meetings/${id}`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null),
        fetch(`/api/meetings/${id}/insights`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null),
        fetch(`/api/meetings/${id}/progress`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null),
      ]);
      setMeeting(m?.meeting || m);
      setInsights(i?.insights || i);
      setProgress(p);
    } catch {}
  }
  useEffect(() => { if (id) void refreshAll(); }, [id]);

  async function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

  async function uploadRecording() {
    if (!file || busy) return; setBusy(true);
    try {
      // 1) get upload-url
      const fd = new FormData();
      fd.set("filename", file.name);
      fd.set("contentType", file.type || "application/octet-stream");
      const u = await fetch(`/api/meetings/${id}/upload-url`, { method: "POST", body: fd });
      const { uploadUrl, objectUri } = await u.json();
      if (!uploadUrl || !objectUri) { alert("Failed to get upload URL"); return; }
      // 2) PUT bytes
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      // 3) set recording
      const setFd = new FormData(); setFd.set("objectUri", objectUri);
      await fetch(`/api/meetings/${id}/recording`, { method: "POST", body: setFd });
      await refreshAll();

      // Auto pipeline: transcribe -> wait -> insights -> wait
      setWorking(true);
      await fetch(`/api/meetings/${id}/transcribe`, { method: "POST" });
      for (let i = 0; i < 30; i++) {
        const p = await fetch(`/api/meetings/${id}/progress`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null);
        if (p?.recording?.status === "transcribed") break;
        await sleep(2000);
      }
      await refreshAll();

      await fetch(`/api/meetings/${id}/insights/run`, { method: "POST" });
      for (let i = 0; i < 30; i++) {
        const p = await fetch(`/api/meetings/${id}/progress`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null);
        if (p?.insights?.status === "ready") break;
        await sleep(2000);
      }
      await refreshAll();
    } catch (e) { console.error(e); alert("Upload failed"); }
    finally { setBusy(false); setWorking(false); }
  }

  async function runTranscribe() {
    setBusy(true); setWorking(true);
    try {
      await fetch(`/api/meetings/${id}/transcribe`, { method: "POST" });
      for (let i = 0; i < 30; i++) {
        const p = await fetch(`/api/meetings/${id}/progress`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null);
        if (p?.recording?.status === "transcribed") break;
        await sleep(2000);
      }
      await refreshAll();
    } finally { setBusy(false); setWorking(false); }
  }
  async function runInsights() {
    setBusy(true); setWorking(true);
    try {
      await fetch(`/api/meetings/${id}/insights/run`, { method: "POST" });
      for (let i = 0; i < 30; i++) {
        const p = await fetch(`/api/meetings/${id}/progress`, { cache: "no-store" }).then(r=>r.json()).catch(()=>null);
        if (p?.insights?.status === "ready") break;
        await sleep(2000);
      }
      await refreshAll();
    } finally { setBusy(false); setWorking(false); }
  }

  async function addNote() {
    if (!noteText.trim()) return; setBusy(true);
    try {
      const fd = new FormData(); fd.set("text", noteText.trim());
      await fetch(`/api/meetings/${id}/notes`, { method: "POST", body: fd });
      setNoteText(""); await refreshAll();
    } finally { setBusy(false); }
  }
  async function addAgenda() {
    if (!agendaText.trim()) return; setBusy(true);
    try {
      const fd = new FormData(); fd.set("item", agendaText.trim());
      await fetch(`/api/meetings/${id}/agenda`, { method: "POST", body: fd });
      setAgendaText(""); await refreshAll();
    } finally { setBusy(false); }
  }
  async function addAction(titleOverride?: string, due?: string, assignee?: string) {
    const title = (titleOverride ?? actionText).trim();
    if (!title) return; setBusy(true);
    try {
      const fd = new FormData();
      fd.set("title", title);
      if (assignee) fd.set("assignee", assignee);
      if (due) fd.set("due", due);
      await fetch(`/api/meetings/${id}/actions`, { method: "POST", body: fd });
      setActionText(""); await refreshAll();
    } finally { setBusy(false); }
  }

  async function adoptSuggestedAction(a: any) {
    await addAction(a?.title || "", a?.due || "", a?.assignee || "");
  }

  async function addToCalendar(actionId: string) {
    const start = window.prompt("Start (RFC3339)", new Date().toISOString());
    if (!start) return; const end = window.prompt("End (RFC3339)", new Date(Date.now()+30*60*1000).toISOString());
    const fd = new FormData(); fd.set("start", start); fd.set("end", end || "");
    await fetch(`/api/meetings/${id}/actions/${actionId}/calendar`, { method: "POST", body: fd });
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold truncate">{meeting?.title || "Meeting"}</h1>
        <div className="flex gap-2 flex-wrap">
          <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="max-w-xs" />
          <button className="border rounded px-3 py-2" onClick={uploadRecording} disabled={!file || busy}>{busy?"Working…":"Upload"}</button>
          <button className="border rounded px-3 py-2" onClick={runTranscribe} disabled={busy}>Transcribe</button>
          <button className="border rounded px-3 py-2" onClick={runInsights} disabled={busy}>Run Insights</button>
        </div>
      </div>

      {/* Content: Left media + Right side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left column */}
        <div className="lg:col-span-8 border rounded p-3">
          <div className="aspect-video bg-black/5 border rounded overflow-hidden">
            {progress?.recording?.objectUri || meeting?.recording?.objectUri ? (
              <video ref={videoRef} controls className="w-full h-full object-contain" src={`/api/proxy-file?objectUri=${encodeURIComponent(progress?.recording?.objectUri || meeting?.recording?.objectUri)}`}></video>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Video Player (attach recording to preview)</div>
            )}
          </div>
          <div className="mt-3 text-sm text-muted-foreground">Recording: {progress?.recording?.status || meeting?.recording?.status || "idle"} {working?"• processing…":""}</div>

          {/* Chapters */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Chapters ({(insights?.chapters || []).length})</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {(insights?.chapters || []).map((c:any, idx:number)=>(
                <li key={idx}>
                  <button className="underline text-left" onClick={()=>seekTo(c.startSec)}>
                    {c.title} {typeof c.startSec!=="undefined"?`• ${fmtTime(c.startSec)}`:""}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Highlights feed */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Highlights ({(insights?.highlights || []).length})</h3>
            <div className="space-y-2">
              {(insights?.highlights||[]).map((h:any, idx:number)=>(
                <div key={idx} className="border rounded p-2 text-sm flex items-center justify-between">
                  <div className="pr-3">
                    <div className="font-medium">{h.label || "Highlight"}</div>
                    <div className="text-muted-foreground">{h.text || ""}</div>
                  </div>
                  <button className="border rounded px-2 py-1 text-xs whitespace-nowrap" onClick={()=>seekTo(h.startSec)}>
                    {fmtTime(h.startSec)}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {Array.isArray(insights?.keyQuestions) && insights.keyQuestions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Key Questions</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {insights.keyQuestions.map((q:string, i:number)=> (<li key={i}>{q}</li>))}
              </ul>
            </div>
          )}

          {/* Summary text */}
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Summary</h3>
            <p className="text-sm whitespace-pre-wrap">{insights?.summary || (working?"Analyzing…":"No insights yet. Run Insights to generate.")}</p>
          </div>
        </div>

        {/* Right column: sticky, tabbed panel */}
        <div className="lg:col-span-4">
          <div className="border rounded p-3 lg:sticky lg:top-4">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <button className={`px-2 py-1 rounded ${activeTab==='notes'?'bg-accent':''}`} onClick={()=>setActiveTab('notes')}>Notes</button>
              <button className={`px-2 py-1 rounded ${activeTab==='agenda'?'bg-accent':''}`} onClick={()=>setActiveTab('agenda')}>Agenda</button>
              <button className={`px-2 py-1 rounded ${activeTab==='actions'?'bg-accent':''}`} onClick={()=>setActiveTab('actions')}>Action</button>
            </div>

            {activeTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Add note" value={noteText} onChange={e=>setNoteText(e.target.value)} />
                  <button className="border rounded px-2 py-1 text-sm" onClick={addNote} disabled={busy}>Add</button>
                </div>
                <div className="space-y-2">
                  {(meeting?.notes || []).map((n:any)=>(
                    <div key={n.id} className="border rounded p-2 text-sm">{n.text}</div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Add agenda" value={agendaText} onChange={e=>setAgendaText(e.target.value)} />
                  <button className="border rounded px-2 py-1 text-sm" onClick={addAgenda} disabled={busy}>Add</button>
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {(meeting?.agenda || []).map((a:any)=>(<li key={a.id}>{a.item || a.text}</li>))}
                </ul>
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input className="border rounded px-2 py-1 text-sm w-full" placeholder="Add action" value={actionText} onChange={e=>setActionText(e.target.value)} />
                  <button className="border rounded px-2 py-1 text-sm" onClick={()=>addAction()} disabled={busy}>Add</button>
                </div>
                <div className="space-y-2">
                  {(meeting?.actions || []).map((a:any)=>(
                    <div key={a.id} className="border rounded p-2 text-sm flex items-center justify-between">
                      <span>{a.title}</span>
                      <button className="border rounded px-2 py-1 text-xs" onClick={()=>addToCalendar(a.id)}>Add To Calendar</button>
                    </div>
                  ))}
                </div>
                {Array.isArray(insights?.extractedActions) && insights?.extractedActions?.length > 0 && (
                  <div className="pt-3 border-t mt-3">
                    <h4 className="text-sm font-medium mb-2">Suggested by AI</h4>
                    <div className="space-y-2">
                      {insights.extractedActions.map((sa:any, idx:number)=> (
                        <div key={idx} className="border rounded p-2 text-sm flex items-center justify-between">
                          <span>{sa.title}</span>
                          <button className="border rounded px-2 py-1 text-xs" onClick={()=>adoptSuggestedAction(sa)}>Adopt</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
