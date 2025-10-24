"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Search, 
    ChevronDown,
    Upload,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react";

interface Meeting {
    id: string;
    title?: string;
    provider?: string;
    date?: string;
    tags?: string[];
    owner?: string;
    recording?: { status?: string; objectUri?: string; duration?: number };
    insights?: { status?: string; summary?: string };
}

interface MeetingsContentProps {
    activeTab: "my-meetings" | "shared-with-me" | "incomplete";
    searchQuery: string;
}

async function fetchMeetings(): Promise<Meeting[]> {
    try {
        const resp = await fetch("/api/meetings", { cache: "no-store" });
        const json = await resp.json();
        return Array.isArray(json?.meetings) ? json.meetings : [];
    } catch {
        return [];
    }
}

export const MeetingsContent = ({ activeTab, searchQuery }: MeetingsContentProps) => {
    const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 1;

    async function load() {
        setLoading(true);
        const data = await fetchMeetings();
        setMeetings(data);
        setLoading(false);
    }

    useEffect(() => { void load(); }, []);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedMeetings(meetings.map(m => m.id));
        else setSelectedMeetings([]);
    };

    const handleSelectMeeting = (meetingId: string, checked: boolean) => {
        if (checked) {
            setSelectedMeetings(prev => [...prev, meetingId]);
        } else {
            setSelectedMeetings(prev => prev.filter(id => id !== meetingId));
        }
    };

    const filteredMeetings = meetings.filter(meeting => {
        const name = (meeting.title || "").toLowerCase();
        const provider = (meeting.provider || "").toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || provider.includes(q);
    });

    return (
        <div className="flex-1 p-6">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Meetings"
                            className="pl-10 w-64"
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                Source
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>All Sources</DropdownMenuItem>
                            <DropdownMenuItem>Google Meet</DropdownMenuItem>
                            <DropdownMenuItem>Zoom</DropdownMenuItem>
                            <DropdownMenuItem>Microsoft Teams</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
                    <input id="meeting-upload-input" type="file" accept="video/*,audio/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                            // create a meeting first
                            const fd = new FormData();
                            fd.set('title', file.name);
                            const createResp = await fetch('/api/meetings', { method: 'POST', body: fd });
                            const createJson = await createResp.json();
                            if (!createResp.ok || !createJson?.id) return;
                            const meetingId = String(createJson.id);

                            // get signed upload url
                            const upForm = new FormData();
                            upForm.set('filename', file.name);
                            upForm.set('contentType', file.type || 'application/octet-stream');
                            const urlResp = await fetch(`/api/meetings/${meetingId}/upload-url`, { method: 'POST', body: upForm });
                            const urlJson = await urlResp.json();
                            if (!urlResp.ok || !urlJson?.uploadUrl) return;

                            // PUT to signed URL or backend fallback
                            await fetch(urlJson.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });

                            // register recording
                            const recForm = new FormData();
                            recForm.set('objectUri', urlJson.objectUri);
                            await fetch(`/api/meetings/${meetingId}/recording`, { method: 'POST', body: recForm });

                            // kick off transcription
                            await fetch(`/api/meetings/${meetingId}/transcribe`, { method: 'POST' });
                            try { alert('Upload received. Transcription started.'); } catch {}
                            await load();
                        } catch {}
                        (e.target as HTMLInputElement).value = '';
                    }} />
                    <Button className="gap-2" onClick={() => document.getElementById('meeting-upload-input')?.click()}>
                        <Upload className="h-4 w-4" />
                        Upload
                    </Button>
                </div>
            </div>

            {/* Meetings Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox checked={selectedMeetings.length === meetings.length && meetings.length > 0} onCheckedChange={handleSelectAll} />
                            </TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMeetings.map((meeting) => (
                            <TableRow key={meeting.id} className="cursor-pointer" onClick={() => { window.location.href = `/meetings/${meeting.id}`; }}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMeetings.includes(meeting.id)}
                                        onCheckedChange={(checked) => 
                                            handleSelectMeeting(meeting.id, checked as boolean)
                                        }
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{meeting.provider || '-'}</TableCell>
                                <TableCell className="font-medium">
                                    <Link href={`/meetings/${meeting.id}`} onClick={(e)=>e.stopPropagation()} className="hover:underline">
                                        {meeting.title || meeting.id}
                                    </Link>
                                </TableCell>
                                <TableCell>{meeting.date || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Badge variant="secondary">Rec: {meeting.recording?.status || 'idle'}</Badge>
                                        <Badge variant="secondary">Insights: {meeting.insights?.status || 'idle'}</Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={async () => { await fetch(`/api/meetings/${meeting.id}/transcribe`, { method: 'POST' }); await load(); }}>Transcribe</DropdownMenuItem>
                                            <DropdownMenuItem onClick={async () => { const r = await fetch(`/api/meetings/${meeting.id}/insights`); const j = await r.json(); try { alert(j?.insights?.summary || 'No insights'); } catch {} }}>Insights</DropdownMenuItem>
                                            <DropdownMenuItem onClick={async () => { await fetch(`/api/meetings/${meeting.id}`, { method: 'DELETE' }); await load(); }}>Delete Meeting</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">{loading ? 'Loading…' : `Showing ${filteredMeetings.length} of ${meetings.length} meetings`}</div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="default" size="sm" className="h-8 w-8 p-0">
                            1
                        </Button>
                        <span className="text-sm text-muted-foreground">of {totalPages}</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
