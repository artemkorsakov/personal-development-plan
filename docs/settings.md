# 📌 System settings

## 🌐 Interface language

**Localization** is determined automatically based on:
`Obsidian General Settings → Language`.
Supported languages:

- **English** (default)
- **Russian**

_Note:_ All texts inside the plugin (notifications, button names) will be translated according to the selected language.

> To add support for any other language, create a [localization-???.ts](https://github.com/artemkorsakov/personal-development-plan/tree/master/localization)
> file similar to `localization-en.ts`.
> And add it to the [translations](https://github.com/artemkorsakov/personal-development-plan/blob/master/localization/localization.ts) list.

## ⚙️ General settings

### 📂 Path to tasks folder

Specifies where task files are stored in your Obsidian repository.

- **Recommended values:**
    - `PersonalDevelopmentPlan` is the default folder
    - `Projects/Tasks` is an example of an alternative path

### 🔢 Maximum active tasks

Limit of simultaneously running tasks with the "In progress" status.

When trying to add a new task over the limit, a warning appears:

`"Too many tasks in progress! Return some of them to the queue."`

- **Recommended values:**
  `3-5 tasks` is optimal for focusing.

`1-10` is an acceptable range.

Limit for:

- Reducing stress and risk of burnout
- Improving learning efficiency
- Improving focus on priorities

### 📅 Start of statistics count

The date from which the system begins collecting analytics on your productivity.

**How is it used?**

- Calculates the **average speed of task completion**
- Builds **forecasts** for future tasks

If you usually complete 5 tasks per week, the plugin will offer:

- Realistic deadlines for new tasks
- Warn about overload

## 📚 Material types

### 🏷️ Standard types

- Book
- Article
- Video
- Podcast
- Course

### ⚡ Features:

1. **Editing:**
   - Changing the type name (for example, rename "Video" → "Lecture")
   - Enable/disable display in the interface (checkbox)

2. **Flexible order:**
   Drag and drop types in the desired order - this is how they will be displayed in the lists.

3. **Checklists:**
   For each type, you can set template items that are automatically added when you create a task.

   _Example for the "Course" type:_
       - Complete module 1
       - Complete a practical assignment
       - Take notes

### ➕ Adding your own type

1. Click `+ New type`
2. Fill in the parameters:
   - **Name** (e.g. "Webinar")
   - **Checklist** (optional)
3. Set up visibility and order.

## 📂 Sections

Sections help group tasks by topic for easy planning.

Examples:

- "Programming"
- "Foreign languages"
- "Personal development"

**Flexible sorting:** Drag sections in the desired sequence.

## 🔄 Periodic tasks

| Period    | Auto-enable | Example tasks                        |
|-----------|-------------|--------------------------------------|
| Daily     | ✅           | Morning Ritual, Read 10 Pages        |
| Weekly    | ✅           | Goal Review, Workspace Cleaning      |
| Monthly   | ✅           | Progress Review, Next Month Planning |
| Quarterly | ✅           | Skills Review, Resume Update         |
| Yearly    | ✅           | Global Goals, Year-End Review        |

### 🛠️ Task Management

- **Add:**
  The `+ Add Task` button under each period.

- **Delete:**
  Click `×` next to the unnecessary task.

- **Features:**
    - Tasks can be edited at any time
    - Markdown formatting support in descriptions

## 💡 Usage tips

1. Start with 3-4 active tasks.
2. **Material checklists:** Set up templates for frequently used types in advance - this will save time.
3. **Recurring tasks:** Use to form habits (e.g. daily word review).
4. **Sections:** Create topic groups for complex projects (e.g. "Learn Scala → Subproject: Cats Effect").
