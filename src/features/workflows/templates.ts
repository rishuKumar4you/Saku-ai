// Workflow templates for Gmail, Calendar, Drive

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "email" | "calendar" | "drive";
  icons: string[];  // Emoji icons
  config: {
    trigger: string;
    actions: string[];
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "email_summarizer",
    name: "Email Summarizer",
    description: "Automatically summarize long emails and extract key action items for quick review.",
    category: "email",
    icons: ["📧", "🤖", "📝"],
    config: {
      trigger: "New email received",
      actions: ["Read email", "AI summarize", "Extract actions", "Send summary"],
    },
  },
  {
    id: "meeting_scheduler",
    name: "Meeting Scheduler",
    description: "Coordinate meeting times across multiple participants and auto-send calendar invites.",
    category: "calendar",
    icons: ["📅", "🔗", "✉️"],
    config: {
      trigger: "Email with meeting request",
      actions: ["Find available slots", "Create calendar event", "Send invites"],
    },
  },
  {
    id: "data_backup",
    name: "Data Backup",
    description: "Automatically backup important files to cloud storage on a scheduled basis.",
    category: "drive",
    icons: ["💾", "☁️", "🔒"],
    config: {
      trigger: "Scheduled (daily)",
      actions: ["Find important files", "Upload to Drive", "Send confirmation"],
    },
  },
  {
    id: "invoice_generator",
    name: "Invoice Generator",
    description: "Generate and send professional invoices with automated payment reminders.",
    category: "email",
    icons: ["📄", "💰", "✉️"],
    config: {
      trigger: "Manual trigger",
      actions: ["Generate invoice", "Create PDF", "Email client"],
    },
  },
  {
    id: "social_media_poster",
    name: "Social Media Poster",
    description: "Schedule and post content across multiple social media platforms simultaneously.",
    category: "calendar",
    icons: ["📱", "📤", "⏰"],
    config: {
      trigger: "Scheduled",
      actions: ["Fetch content", "Post to platforms", "Track engagement"],
    },
  },
  {
    id: "lead_tracker",
    name: "Lead Tracker",
    description: "Track and manage sales leads with automatic follow-up reminders and progress updates.",
    category: "email",
    icons: ["👥", "📊", "🔔"],
    config: {
      trigger: "New lead email",
      actions: ["Extract lead info", "Add to CRM", "Schedule follow-up"],
    },
  },
];

export function getTemplatesByCategory(category: string) {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string) {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}

