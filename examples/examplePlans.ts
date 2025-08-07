export interface ExamplePlan {
    name: string;
    description: string;
    data: string;
}

export const EXAMPLE_PLANS: ExamplePlan[] = [
    {
        name: "Foundations of Functional Programming & Software Excellence",
        description: "This comprehensive learning plan is designed to deepen your understanding of functional programming principles, software engineering best practices, and algorithmic thinking.",
        data: `{
                 "articles": [
                   {
                     "status": "knowledge-base",
                     "title": "Where do These People Get Their (Unoriginal) Ideas",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Where_do_These_People_Get_Their_(Unoriginal)_Ideas.md",
                     "link": "https://www.joelonsoftware.com/2000/04/19/where-do-these-people-get-their-unoriginal-ideas/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Types and Typeclasses Believe the type",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Types_and_Typeclasses_Believe_the_type.md",
                     "link": "https://learnyouahaskell.com/types-and-typeclasses",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Top Five (Wrong) Reasons You Don’t Have Testers",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Top_Five_(Wrong)_Reasons_You_Don’t_Have_Testers.md",
                     "link": "https://www.joelonsoftware.com/2000/04/30/top-five-wrong-reasons-you-dont-have-testers/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Software requirements do not change",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Software_requirements_do_not_change.md",
                     "link": "https://blog.tmorris.net/posts/software-requirements-do-not-change/index.html",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Reading postmortems",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Reading_postmortems.md",
                     "link": "https://danluu.com/postmortem-lessons/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Principles of Automated Testing",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Principles_of_Automated_Testing.md",
                     "link": "https://www.lihaoyi.com/post/PrinciplesofAutomatedTesting.html",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Painless Software Schedules",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Painless_Software_Schedules.md",
                     "link": "https://www.joelonsoftware.com/2000/03/29/painless-software-schedules/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Maybe in Java",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Maybe_in_Java.md",
                     "link": "https://blog.tmorris.net/posts/maybe-in-java/index.html",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Making something out of nothing (or, why None is better than NaN and NULL)",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Making_something_out_of_nothing_(or,_why_None_is_better_than_NaN_and_NULL).md",
                     "link": "https://blog.janestreet.com/making-something-out-of-nothing-or-why-none-is-better-than-nan-and-null/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "I hate NULL",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "I_hate_NULL.md",
                     "link": "https://alexn.org/blog/2010/05/25/i-hate-null/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Functional Programming Isn't the Answer",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Functional_Programming_Isn't_the_Answer.md",
                     "link": "https://degoes.net/articles/fp-is-not-the-answer",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Beating the Averages",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Beating_the_Averages.md",
                     "link": "https://paulgraham.com/avg.html",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Bad software examples - how much can poor code hurt you",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bad_software_examples_-_how_much_can_poor_code_hurt_you.md",
                     "link": "https://softwaremill.com/bad-software-examples-how-much-can-poor-code-hurt-you/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "An Interview Process That Works For Me",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "An_Interview_Process_That_Works_For_Me.md",
                     "link": "https://blog.colinbreck.com/an-interview-process-that-works-for-me/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "A Brief History of Programming Languages",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "A_Brief_History_of_Programming_Languages.md",
                     "link": "https://james-iry.blogspot.com/2009/05/brief-incomplete-and-mostly-wrong.html",
                     "durationInMinutes": 7
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Strong Type Systems",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Strong_Type_Systems.md",
                     "link": "https://blog.tmorris.net/posts/strong-type-systems/index.html",
                     "durationInMinutes": 5
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Parse, don’t validate",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Parse,_don’t_validate.md",
                     "link": "https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/",
                     "durationInMinutes": 10
                   }
                 ],
                 "books": [
                   {
                     "status": "knowledge-base",
                     "title": "Richard Bird - Introduction to functional programming",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Richard_Bird_-_Introduction_to_functional_programming.md",
                     "authors": "Richard Bird",
                     "name": "Introduction to functional programming",
                     "pages": 316
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Bhim P. Upadhyaya - Data Structures and Algorithms with Scala",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bhim_P._Upadhyaya_-_Data_Structures_and_Algorithms_with_Scala.md",
                     "authors": "Bhim P. Upadhyaya",
                     "name": "Data Structures and Algorithms with Scala",
                     "pages": 154
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Robert Sedgewick and Kevin Wayne - Algorithms, 4th Edition",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Robert_Sedgewick_and_Kevin_Wayne_-_Algorithms,_4th_Edition.md",
                     "authors": "Robert Sedgewick and Kevin Wayne",
                     "name": "Algorithms, 4th Edition",
                     "pages": 976
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Bartosz Milewski - The Dao of Functional Programming",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bartosz_Milewski_-_The_Dao_of_Functional_Programming.md",
                     "authors": "Bartosz Milewski",
                     "name": "The Dao of Functional Programming",
                     "pages": 340
                   },
                   {
                     "status": "knowledge-base",
                     "title": "H. Abelson, G. J. Sussman, J. Sussman - Structure and Interpretation of Computer Programs",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "H._Abelson,_G._J._Sussman,_J._Sussman_-_Structure_and_Interpretation_of_Computer_Programs.md",
                     "authors": "H. Abelson, G. J. Sussman, J. Sussman",
                     "name": "Structure and Interpretation of Computer Programs",
                     "pages": 883
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Bartosz Milewski - Category Theory for Programmers",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bartosz_Milewski_-_Category_Theory_for_Programmers.md",
                     "authors": "Bartosz Milewski",
                     "name": "Category Theory for Programmers",
                     "pages": 350
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Donald E. Knuth - The Art of Computer Programming",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Donald_E._Knuth_-_The_Art_of_Computer_Programming.md",
                     "authors": "Donald E. Knuth",
                     "name": "The Art of Computer Programming",
                     "pages": 3799
                   }
                 ],
                 "courses": [
                   {
                     "status": "knowledge-base",
                     "title": "Algorithms, Part II",
                     "type": "Course",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Algorithms,_Part_II.md",
                     "platform": "Coursera",
                     "link": "https://www.coursera.org/learn/algorithms-part2",
                     "durationInMinutes": 1800
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Algorithms, Part I",
                     "type": "Course",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Algorithms,_Part_I.md",
                     "platform": "Coursera",
                     "link": "https://www.coursera.org/learn/algorithms-part1",
                     "durationInMinutes": 1800
                   }
                 ],
                 "podcasts": [
                   {
                     "status": "knowledge-base",
                     "title": "Corecursive",
                     "type": "Podcast",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Corecursive.md",
                     "platform": "Apple podcasts",
                     "link": "https://corecursive.com/",
                     "episodes": 110,
                     "durationInMinutes": 45
                   }
                 ],
                 "userTypes": [],
                 "videos": [
                   {
                     "status": "knowledge-base",
                     "title": "Some History of Functional Programming Languages",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Some_History_of_Functional_Programming_Languages.md",
                     "author": "Some History of Functional Programming Languages",
                     "platform": "YouTube",
                     "link": "https://www.youtube.com/watch?v=QVwm9jlBTik",
                     "durationInMinutes": 27
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Null References The Billion Dollar Mistake",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Null_References_The_Billion_Dollar_Mistake.md",
                     "author": "Charles Hoare",
                     "platform": "Infoq",
                     "link": "https://www.infoq.com/presentations/Null-References-The-Billion-Dollar-Mistake-Tony-Hoare/",
                     "durationInMinutes": 62
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Business benefits of FP",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Business_benefits_of_FP.md",
                     "author": "Business benefits of FP",
                     "platform": "YouTube",
                     "link": "https://www.youtube.com/watch?v=EcGZdzECmIk",
                     "durationInMinutes": 46
                   },
                   {
                     "status": "knowledge-base",
                     "title": "MIT 6.001 Structure and Interpretation",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "MIT_6.001_Structure_and_Interpretation.md",
                     "author": "MIT",
                     "platform": "Youtube",
                     "link": "https://www.youtube.com/playlist?list=PLE18841CABEA24090",
                     "durationInMinutes": 1920
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Functional Programming Group",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Functional_Programming_Group.md",
                     "author": "Functional Programming Group",
                     "platform": "YouTube",
                     "link": "https://www.youtube.com/watch?app=desktop&v=s2ay9nEW3ak&list=PLNo5uJesLLQjRmM9lASwVeL0fFtJuKU0U",
                     "durationInMinutes": 120
                   }
                 ],
                 "exportedAt": "2025-08-06T07:00:04.970Z"
               }`
    }
];
