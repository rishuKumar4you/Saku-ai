"use client";

import { useState } from "react";
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
    source: string;
    name: string;
    dateTime: string;
    tags: string[];
    owner: {
        name: string;
        avatar?: string;
        initials: string;
    };
}

interface MeetingsContentProps {
    activeTab: "my-meetings" | "shared-with-me" | "incomplete";
    searchQuery: string;
}

// Mock data for meetings
const mockMeetings: Meeting[] = [
    {
        id: "1",
        source: "Google Meet",
        name: "Client Meeting",
        dateTime: "Wed, Jun 19, 2024",
        tags: ["Brainstorming"],
        owner: {
            name: "Alice Johnson",
            initials: "AJ"
        }
    },
    {
        id: "2",
        source: "Zoom",
        name: "Edward Meeting",
        dateTime: "Wed, Jun 19, 2024",
        tags: ["Brainstorming"],
        owner: {
            name: "Bob Smith",
            initials: "BS"
        }
    },
    {
        id: "3",
        source: "Google Meet",
        name: "Team Meeting",
        dateTime: "Wed, Jun 19, 2024",
        tags: ["Brainstorming"],
        owner: {
            name: "Carol Davis",
            initials: "CD"
        }
    },
    {
        id: "4",
        source: "Zoom",
        name: "Boss's Meeting",
        dateTime: "Wed, Jun 19, 2024",
        tags: ["Brainstorming"],
        owner: {
            name: "David Wilson",
            initials: "DW"
        }
    }
];

export const MeetingsContent = ({ activeTab, searchQuery }: MeetingsContentProps) => {
    const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 3;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMeetings(mockMeetings.map(meeting => meeting.id));
        } else {
            setSelectedMeetings([]);
        }
    };

    const handleSelectMeeting = (meetingId: string, checked: boolean) => {
        if (checked) {
            setSelectedMeetings(prev => [...prev, meetingId]);
        } else {
            setSelectedMeetings(prev => prev.filter(id => id !== meetingId));
        }
    };

    const filteredMeetings = mockMeetings.filter(meeting => 
        meeting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.source.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div>
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
                                <Checkbox
                                    checked={selectedMeetings.length === mockMeetings.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>NAME</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead className="w-12">ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMeetings.map((meeting) => (
                            <TableRow key={meeting.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMeetings.includes(meeting.id)}
                                        onCheckedChange={(checked) => 
                                            handleSelectMeeting(meeting.id, checked as boolean)
                                        }
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {meeting.source}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {meeting.name}
                                </TableCell>
                                <TableCell>{meeting.dateTime}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        {meeting.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={meeting.owner.avatar} />
                                            <AvatarFallback className="text-xs">
                                                {meeting.owner.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{meeting.owner.name}</span>
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit Meeting</DropdownMenuItem>
                                            <DropdownMenuItem>Delete Meeting</DropdownMenuItem>
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
                <div className="text-sm text-muted-foreground">
                    Showing {filteredMeetings.length} of {mockMeetings.length} meetings
                </div>
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
