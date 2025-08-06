# Development plan examples

## Purpose of functionality

The functionality of the plan examples allows you to:

1. **Exchange ready-made development plans** within the community
2. **Get a quick start** in new areas of study
3. **Standardize the approach** to personal development
4. **Save time** on creating plans from scratch

> 💡 Example of use: You want to learn Scala.
> Instead of searching for materials yourself, you can import a ready-made plan "Learn Scala",
> containing proven resources and the optimal sequence of study.

## How to export your own plan

1. Go to the "Knowledge Base" tab
2. Click the "Export to JSON" button
3. The system will create a file in the format:

```json
{
  "articles":
  [
    {
      "title": "Functional Programming Principles",
      "type": "Article",
      "section": "Functional Programming",
      "link": "https://example.com/fp-principles"
    }
  ],
  "books":
  [
    {
      "title": "Programming in Scala",
      "authors": "Martin Odersky",
      "type": "Book",
      "pages": 852
    }
  ]
}
```

> ⚠️ Only tasks from the "Knowledge Base" are exported, because:
>
> - Planning ("Planned") is individual
> - Progress ("In progress") depends on personal circumstances

## How to add a plan to the community

1. Export your plan
2. Create a [Merge Request in the plugin repository](https://github.com/artemkorsakov/personal-development-plan/blob/master/examples/examplePlans.ts)
3. Add the plan to the `examplePlans.ts` file:

```typescript
{
  name: "Learning Scala from Scratch",
  description: "Full Path from Basics to Advanced Concepts",
  data: `... exported json ...`
}
```

## How to import a ready-made plan

1. Go to the "Examples" tab
2. Select the appropriate plan from the list
3. Click "Import"

The system will check:

- Are all the task types from the plan in your settings
- Do all the sections exist in your configuration

Example of an import error:

```
You need to add:
- Task types: "Video course", "OpenSource"
- Sections: "Machine learning", "Neural networks"
```

## Usage recommendations

1. Review the plan contents before importing
2. Adapt imported tasks to your needs
3. Combine multiple plans for comprehensive development
4. Share improved versions of your plans with the community

> 🌟 Best practices: Add your comments to the plan description about how this plan is useful
