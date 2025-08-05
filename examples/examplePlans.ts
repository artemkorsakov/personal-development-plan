export interface ExamplePlan {
    name: string;
    description: string;
    data: string;
}

export const EXAMPLE_PLANS: ExamplePlan[] = [
    {
        name: "Базовый план развития",
        description: "Содержит основные материалы для старта",
        data: `{
            "articles": [
                {
                    "status": "knowledge-base",
                    "title": "Descriptive Variable Names A Code Smell",
                    "type": "Статья",
                    "section": "Общие",
                    "order": 999,
                    "filePath": "Descriptive Variable Names A Code Smell1.md",
                    "link": "https://degoes.net/articles/insufficiently-polymorphic",
                    "durationInMinutes": 11
                }
            ],
            "books": [
                {
                    "status": "knowledge-base",
                    "title": "Лев Толстой - Анна Каренина",
                    "type": "Книга",
                    "section": "Обучение",
                    "order": 999,
                    "filePath": "Лев_Толстой_-_Анна_Каренина1.md",
                    "authors": "Лев Толстой",
                    "name": "Анна Каренина",
                    "pages": 650
                },
                {
                    "status": "knowledge-base",
                    "title": "Лев Толстой - Анна Каренина",
                    "type": "Книга",
                    "section": "Обучение",
                    "order": 999,
                    "filePath": "Лев_Толстой_-_Анна_Каренина2.md",
                    "authors": "Лев Толстой",
                    "name": "Анна Каренина",
                    "pages": 650
                }
            ]
        }`
    }
];
