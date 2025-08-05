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
                }
            ]
        }`
    },
    {
        name: "План для Scala-разработчика",
        description: "Материалы по функциональному программированию на Scala",
        data: `{
            "books": [
                {
                    "status": "knowledge-base",
                    "title": "Volpe Gabriel - Practical FP in Scala",
                    "type": "Книга",
                    "section": "Функциональное программирование",
                    "order": 999,
                    "filePath": "Volpe Gabriel - Practical FP in Scala1.md",
                    "authors": "Volpe Gabriel",
                    "name": "Practical FP in Scala",
                    "pages": 300
                }
            ],
            "courses": [
                {
                    "status": "knowledge-base",
                    "title": "Основы Scala",
                    "type": "Курс",
                    "section": "Scala",
                    "order": 999,
                    "filePath": "Основы Scala1.md",
                    "platform": "Stepik",
                    "link": "https://stepik.org/course/89974/promo",
                    "durationInMinutes": 250
                }
            ]
        }`
    },
    {
        name: "План для технического лидера",
        description: "Материалы для развития управленческих навыков",
        data: `{
            "podcasts": [
                {
                    "status": "knowledge-base",
                    "title": "CTOcast",
                    "type": "Подкаст",
                    "section": "Общие",
                    "order": 999,
                    "filePath": "CTOcast1.md",
                    "platform": "Apple podcasts",
                    "link": "https://podcasts.apple.com/us/podcast/ctocast/id945496997",
                    "episodes": 33,
                    "durationInMinutes": 65
                }
            ],
            "userTypes": [
                {
                    "status": "knowledge-base",
                    "title": "SonarQube",
                    "type": "OpenSearch",
                    "section": "Общие",
                    "order": 999,
                    "filePath": "SonarQube1.md",
                    "laborInputInHours": 12
                }
            ],
		    "videos": [
                {
                    "status": "knowledge-base",
                    "title": "10+ Scala Concepts You Need to Know",
                    "type": "Видео",
                    "section": "Общие",
                    "order": 999,
                    "startDate": "",
                    "dueDate": "",
                    "filePath": "10+_Scala_Concepts_You_Need_to_Know1.md",
                    "author": "DevInsideYou",
                    "platform": "YouTube",
                    "link": "https://www.youtube.com/watch?v=nI57LUpjGrk",
                    "durationInMinutes": 43
                }
            ]
        }`
    }
];
