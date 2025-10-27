# Workflow Trigger System Guide

## Overview

The workflow trigger system allows Email and Schedule triggers to run indefinitely in the background, automatically creating new executions each time they're triggered.

## How It Works

### Manual Triggers
- **Normal Behavior**: Click "Execute" button → Workflow runs once → Shows PENDING → RUNNING → COMPLETED
- **Executions**: Shows as individual executions on the executions page

### Email & Schedule Triggers (Continuous)
- **Start**: Call `/api/triggers/start` endpoint with trigger configuration
- **Monitoring**: Runs continuously in the background via Inngest
- **Triggering**: Each time the trigger condition is met, creates a NEW execution
- **Stop**: Call `/api/triggers/stop` endpoint with triggerId

## API Endpoints

### Start a Trigger Monitor

```bash
POST /api/triggers/start
Content-Type: application/json

{
  "workflowId": "cmh7mn64p0001ckskbr6cc3ng",
  "nodeId": "email-trigger-node-id",
  "nodeType": "EMAIL_TRIGGER",  // or "SCHEDULE_TRIGGER"
  "nodeData": {
    "senderEmail": "example@gmail.com",
    "subjectFilter": "urgent"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "EMAIL_TRIGGER monitor started successfully",
  "triggerId": "cmh8xyz123..."
}
```

### Stop a Trigger Monitor

```bash
POST /api/triggers/stop
Content-Type: application/json

{
  "triggerId": "cmh8xyz123..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trigger monitor stopped successfully"
}
```

## Email Trigger Behavior

1. **Starts**: Monitor begins checking Gmail every 30 seconds
2. **Checks**: Looks for unread emails matching filters (sender, subject)
3. **Triggered**: When matching email found:
   - Marks email as read (won't trigger again)
   - Creates NEW execution with email data
   - Continues monitoring for more emails
4. **Stops**: When `/api/triggers/stop` is called

**Email Data Available in Workflow:**
- `{{triggerNodeId.content}}` - Full email body
- `{{triggerNodeId.email.from}}` - Sender email
- `{{triggerNodeId.email.subject}}` - Email subject
- `{{triggerNodeId.email.date}}` - Email date

## Schedule Trigger Behavior

1. **Starts**: Monitor begins with configured interval
2. **Waits**: Waits for specified time (e.g., 5 minutes, 2 hours, 1 day)
3. **Triggered**: After each interval:
   - Creates NEW execution
   - Continues waiting for next interval
4. **Stops**: When `/api/triggers/stop` is called

**Schedule Data Available in Workflow:**
- `{{triggerNodeId.content}}` - Timestamp of trigger
- `{{triggerNodeId.message}}` - "Schedule trigger activated"

## Database Schema

### WorkflowTrigger Table
```sql
- id: Unique trigger ID
- workflowId: Associated workflow
- nodeId: Trigger node ID in workflow
- triggerType: EMAIL_TRIGGER or SCHEDULE_TRIGGER
- status: ACTIVE or STOPPED
- config: JSON configuration (filters, schedule, etc.)
- lastTriggeredAt: Timestamp of last trigger
- createdAt, updatedAt
```

## Implementation Details

### Inngest Functions

1. **emailTriggerMonitor**
   - Event: `workflow/email-trigger/start`
   - Cancel Event: `workflow/trigger/stop`
   - Checks Gmail API every 30 seconds
   - Creates execution when email found

2. **scheduleTriggerMonitor**
   - Event: `workflow/schedule-trigger/start`
   - Cancel Event: `workflow/trigger/stop`
   - Waits for configured interval
   - Creates execution after each interval

### Execution Flow

```
[Start Trigger] 
    ↓
[Create WorkflowTrigger Record]
    ↓
[Send Inngest Event]
    ↓
[Monitor Loop Starts]
    ↓
┌─────────────────────┐
│ Check Condition     │
│ (email/schedule)    │
└─────────────────────┘
    ↓ (if triggered)
┌─────────────────────┐
│ Create Execution    │
│ Send workflow/      │
│ execute Event       │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Workflow Runs       │
│ PENDING → RUNNING   │
│ → COMPLETED         │
└─────────────────────┘
    ↓
[Back to Check Condition]
```

## Key Features

✅ **Multiple Executions**: Each trigger creates a new execution
✅ **Background Processing**: Runs via Inngest, doesn't block server
✅ **Persistent**: Survives server restarts (Inngest handles state)
✅ **Cancellable**: Can stop monitors at any time
✅ **Trackable**: WorkflowTrigger table tracks all active monitors
✅ **Isolated**: Manual triggers work independently, unaffected by monitors

## Example Usage

### Email Alert System
```javascript
// Start monitoring for urgent emails
await fetch('/api/triggers/start', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    workflowId: 'workflow-id',
    nodeId: 'email-trigger-node',
    nodeType: 'EMAIL_TRIGGER',
    nodeData: {
      senderEmail: 'boss@company.com',
      subjectFilter: 'URGENT'
    }
  })
});

// Each URGENT email from boss triggers workflow automatically
// Workflow can then:
// 1. Parse email content
// 2. Process with AI
// 3. Send response email
// 4. Create calendar event
// ... continues indefinitely until stopped
```

### Scheduled Reports
```javascript
// Start daily report generation
await fetch('/api/triggers/start', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    workflowId: 'report-workflow-id',
    nodeId: 'schedule-trigger-node',
    nodeType: 'SCHEDULE_TRIGGER',
    nodeData: {
      time: 24,
      unit: 'hours',
      enabled: true
    }
  })
});

// Every 24 hours:
// 1. Triggers workflow
// 2. Generates report
// 3. Emails to stakeholders
// ... continues indefinitely until stopped
```

## Testing

### Test Email Trigger
1. Create workflow with EMAIL_TRIGGER → AI → EMAIL nodes
2. Call `/api/triggers/start`
3. Send test email matching filters
4. Check executions page - should see new execution
5. Send another email - should see another execution
6. Call `/api/triggers/stop`

### Test Schedule Trigger
1. Create workflow with SCHEDULE_TRIGGER → AI → EMAIL nodes
2. Call `/api/triggers/start` with short interval (1 minute)
3. Wait 1 minute - should see new execution
4. Wait another minute - should see another execution
5. Call `/api/triggers/stop`

## Troubleshooting

**Monitor not starting?**
- Check Inngest dashboard for errors
- Verify credentials are active
- Check server logs for errors

**Executions not appearing?**
- Check WorkflowTrigger status in database
- Verify trigger conditions are being met
- Check Inngest function logs

**Can't stop monitor?**
- Verify triggerId is correct
- Check trigger belongs to your user
- Monitor will auto-stop on next iteration if status is STOPPED

## Future Enhancements

- [ ] UI for starting/stopping triggers from workflow page
- [ ] Trigger status indicators on workflow cards
- [ ] Trigger execution history and statistics
- [ ] More trigger types (Webhook, Database, etc.)
- [ ] Advanced scheduling (cron expressions)
- [ ] Trigger condition testing before activation

