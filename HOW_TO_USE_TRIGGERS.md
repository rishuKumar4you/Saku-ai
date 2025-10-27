# 🚀 How to Use Continuous Triggers

## ⚠️ IMPORTANT: Two Different Actions

There are **TWO separate actions** for workflows with Email or Schedule triggers:

### 1️⃣ **"Execute" Button** (One-Time Run)
- Runs the workflow **ONCE** immediately
- Goes through: PENDING → RUNNING → COMPLETED
- Stops after completion
- **Use for**: Testing your workflow

### 2️⃣ **"Start Continuous Monitoring" Button** (Indefinite Runs)
- Starts a **background monitor** via Inngest
- Runs **INDEFINITELY**, creating new executions automatically
- For Email Trigger: Creates execution each time matching email arrives
- For Schedule Trigger: Creates execution at each interval
- **Use for**: Production automation

---

## 📖 Step-by-Step Guide

### For Schedule Triggers (e.g., Run every 5 minutes)

#### ❌ What you were doing (runs once):
1. Create workflow with SCHEDULE_TRIGGER node
2. Configure: "Every 5 minutes"
3. Click **"Execute"** button
4. Result: Workflow runs ONCE, then stops ❌

#### ✅ What you should do (runs indefinitely):
1. Create workflow with SCHEDULE_TRIGGER node
2. Configure: "Every 5 minutes"  
3. Save the workflow
4. Click **"Start Continuous Monitoring"** button (NEW!)
5. Result: 
   - Toast: "SCHEDULE_TRIGGER monitor started successfully!"
   - Every 5 minutes: New execution created automatically
   - Continues forever until you click "Stop Monitoring"
   - You'll see multiple executions on the executions page ✅

### For Email Triggers (e.g., Watch for emails)

#### ❌ What you were doing (runs once):
1. Create workflow with EMAIL_TRIGGER node
2. Configure: sender email, subject filter
3. Click **"Execute"** button
4. Result: Checks once for email, then stops ❌

#### ✅ What you should do (runs indefinitely):
1. Create workflow with EMAIL_TRIGGER node
2. Configure: sender email, subject filter
3. Save the workflow
4. Click **"Start Continuous Monitoring"** button (NEW!)
5. Result:
   - Toast: "EMAIL_TRIGGER monitor started successfully!"
   - Checks Gmail every 30 seconds
   - Each matching email: New execution created automatically
   - Continues forever until you click "Stop Monitoring"
   - You'll see multiple executions on the executions page ✅

---

## 🎯 Quick Reference

| Action | Button | Behavior | Use Case |
|--------|--------|----------|----------|
| Test Workflow | **Execute** | Runs once, stops | Testing, debugging |
| Production Mode | **Start Continuous Monitoring** | Runs indefinitely | Real automation |

---

## 🖥️ UI Changes

### In Workflow Editor (Header):

**Before:**
```
[Workflows] > [My Workflow]                    [Execute]
```

**After (when workflow has trigger nodes):**
```
[Workflows] > [My Workflow]    [Start Continuous Monitoring] [Execute]
```

**When monitoring is active:**
```
[Workflows] > [My Workflow]    [Stop Monitoring (1 active)] [Execute]
```

---

## 📊 What You'll See

### Executions Page - Schedule Trigger Example

**Without Continuous Monitoring** (using Execute button):
```
Execution 1: COMPLETED (5 minutes ago)
... nothing else ...
```

**With Continuous Monitoring** (using Start Continuous Monitoring):
```
Execution 5: COMPLETED (just now)
Execution 4: COMPLETED (5 minutes ago)
Execution 3: COMPLETED (10 minutes ago)
Execution 2: COMPLETED (15 minutes ago)
Execution 1: COMPLETED (20 minutes ago)
... continues every 5 minutes ...
```

---

## 💡 Examples

### Example 1: Daily Report at 9 AM

```typescript
// 1. Create workflow:
SCHEDULE_TRIGGER (every 24 hours)
  → AI_GEMINI (generate report)
  → EMAIL (send to team@company.com)

// 2. Click "Start Continuous Monitoring"

// Result: Every 24 hours, automatically:
// - Generates report
// - Sends email
// - Creates new execution
// - Continues indefinitely
```

### Example 2: Auto-Reply to Customer Emails

```typescript
// 1. Create workflow:
EMAIL_TRIGGER (from: support@example.com, subject: "Help")
  → AI_OPENAI (analyze email)
  → EMAIL (send response)

// 2. Click "Start Continuous Monitoring"

// Result: Each time email arrives:
// - Triggers workflow
// - AI analyzes
// - Sends response
// - Creates new execution
// - Continues monitoring for next email
```

---

## 🔍 Troubleshooting

### "I clicked Execute but it only ran once"
✅ **Solution**: Click "Start Continuous Monitoring" instead

### "I don't see the 'Start Continuous Monitoring' button"
✅ **Check**: 
- Does your workflow have an EMAIL_TRIGGER or SCHEDULE_TRIGGER node?
- Button only appears when trigger nodes are present

### "How do I stop the monitoring?"
✅ **Solution**: Click "Stop Monitoring" button (replaces "Start Continuous Monitoring" when active)

### "Can I use Execute button for testing?"
✅ **Yes!** Execute button is perfect for testing. It runs the workflow once without starting continuous monitoring.

---

## 🎓 Technical Details

### Behind the Scenes:

**Execute Button:**
```
User clicks Execute
  → Creates 1 execution
  → Runs workflow
  → DONE
```

**Start Continuous Monitoring:**
```
User clicks Start Continuous Monitoring
  → Creates WorkflowTrigger record in database
  → Sends event to Inngest
  → Inngest starts background monitor function
  → Monitor runs in infinite loop:
      - Check condition (email/schedule)
      - If triggered: Create NEW execution
      - Wait
      - Repeat
  → Continues until "Stop Monitoring" clicked
```

---

## ✅ Best Practices

1. **Test First**: Use Execute button to test your workflow
2. **Then Activate**: Once working, use Start Continuous Monitoring
3. **Monitor**: Check executions page to see automatic runs
4. **Stop When Done**: Don't forget to stop monitoring if no longer needed

---

## 🎉 You're All Set!

Now you can:
- ✅ Test workflows with Execute button (runs once)
- ✅ Activate continuous automation with Start Continuous Monitoring (runs indefinitely)
- ✅ See multiple executions appear automatically
- ✅ Stop monitoring when needed

Happy automating! 🚀

