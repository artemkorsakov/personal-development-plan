# Recurring Task System

## Basic Concept

Recurring tasks are an automated system for managing recurring actions in your personal development plan.

Unlike one-time tasks, which are created and completed manually,
recurring tasks are generated automatically according to a set schedule.

### Why is this necessary?

1. **Routine automation** - eliminates the need to manually create the same tasks
2. **Regularity control** - helps not to miss important repetitive actions
3. **Reducing cognitive load** - no need to keep a list of repetitive tasks in your head

## Mechanism of operation

### Periodic task card

![Periodic tasks](images/periodicTask.png)

### Task generation

When you click on the card, the system:

1. Checks all periods from the statistics start date to the current date
2. For each period, creates tasks if:
   - The task type is enabled in [settings](settings.md)
   - Tasks for this period have not yet been created
3. Adds new tasks to the end of the file

Example file structure:

```markdown
# One-time tasks

- [ ] Write an article about tuples in Scala
- [ ] Prepare a presentation for meetup

# Periodic tasks

#### 2025-08-01 (Friday)

- [ ] Morning email review
- [ ] Read a chapter from a book
- [ ] Physical activity for 30 min

#### Week 31 (2025-07-28 — 2025-08-03)

- [ ] Solve a problem on Project Euler
- [ ] Listen to the Culips podcast

#### August 2025

- [ ] Watch a video from a ScalaConf talk

#### Q3 2025 (July—September)

- [ ] Update your resume
- [ ] Conduct a skills audit

#### 2025

- [ ] Update your individual development plan: delete outdated tasks, detail current ones
```

The card contains two main section:

1. **One-time tasks** - created and managed manually
2. **Recurring tasks** - generated automatically

## Types of recurrences and examples of use

### Daily tasks

**Format:** "2025-08-01 (Friday)"

**Task examples:**

- Planning the day
- Evening review of completed tasks
- Reading professional literature (30 min)
- Physical exercise

**Why:** Forming healthy habits and daily practices

### Weekly tasks

**Format:** "Week 31 (2025-07-28 — 2025-08-03)"

**Task examples:**

- Summarizing the week
- Learning a new tech stack (2 hours)
- Cleaning the workspace

**Why:** Regularly monitoring progress and maintaining order

### Monthly tasks

**Format:** "August 2025"

**Task examples:**

- Analysis of monthly achievements
- Planning training for the next month
- Checking and updating backups

**Why:** Strategic planning and monitoring of key indicators

### Quarterly tasks

**Format:** "3rd quarter 2025 (July-September)"

**Task examples:**

- Audit of professional skills
- Update career plan
- Checking and updating equipment
- Participation in professional event

**Why:** Adjustment of long-term plans and development strategies

### Annual tasks

**Format:** "2025"

**Task examples:**

- Setting annual goals
- Annual report on professional growth
- Portfolio update
- Vacation planning

**Why:** Global planning and reflection

## System setup

### Task configuration

[Recurring task settings](settings.md)

For each task type, you can:

1. Enable/disable generation
2. Set a task list (Markdown is supported)

### Configuration recommendations

1. Start small - add 2-3 daily tasks
2. Review the task list regularly, once a month
3. Use clear and measurable wording

## Best practices

### For daily tasks:

- Group small routine actions
- Leave room for flexibility (e.g. "30 min to choose from: reading/watching a lecture")
- Include tasks for health and rest

### For weekly/monthly tasks:

- Add tasks for reflection and analysis
- Include creative and developmental activities
- Plan time for "technical debt"

### For quarterly/annual tasks:

- Focus on strategic goals
- Include tasks for professional development
- Don't forget about personal and family aspects

## Conclusion

A periodic task system will help you automate routine tasks
and focus on the really important aspects of your development!
