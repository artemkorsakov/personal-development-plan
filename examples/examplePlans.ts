export interface ExamplePlan {
    name: string;
    description: string;
    data: string;
}

export const EXAMPLE_PLANS: ExamplePlan[] = [
    {
        name: "Foundations of functional programming & Software excellence",
        description: "This comprehensive learning plan is designed to deepen your understanding of functional programming principles, software engineering best practices, and algorithmic thinking.",
        data: `{
                 "articles": [
                   {
                     "status": "knowledge-base",
                     "title": "Where do these people get their (unoriginal) ideas?",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Where_do_these_people_get_their_(unoriginal)_ideas.md",
                     "link": "https://www.joelonsoftware.com/2000/04/19/where-do-these-people-get-their-unoriginal-ideas/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Types and typeclasses believe the type",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Types_and_typeclasses_believe_the_type.md",
                     "link": "https://learnyouahaskell.com/types-and-typeclasses",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Top five (wrong) reasons you don’t have testers",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Top_five_(wrong)_reasons_you_don't_have_testers.md",
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
                     "title": "Principles of automated testing",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Principles_of_automated_testing.md",
                     "link": "https://www.lihaoyi.com/post/PrinciplesofAutomatedTesting.html",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Painless software schedules",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Painless_software_schedules.md",
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
                     "title": "Functional programming isn't the answer",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Functional_programming_isn't_the_answer.md",
                     "link": "https://degoes.net/articles/fp-is-not-the-answer",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Beating the averages",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Beating_the_averages.md",
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
                     "title": "An interview process that works for me",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "An_interview_process_that_works_for_me.md",
                     "link": "https://blog.colinbreck.com/an-interview-process-that-works-for-me/",
                     "durationInMinutes": 10
                   },
                   {
                     "status": "knowledge-base",
                     "title": "A brief history of programming languages",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "A_brief_history_of_programming_languages.md",
                     "link": "https://james-iry.blogspot.com/2009/05/brief-incomplete-and-mostly-wrong.html",
                     "durationInMinutes": 7
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Strong type systems",
                     "type": "Article",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Strong_type_systems.md",
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
                     "title": "Bhim P. Upadhyaya - Data structures and algorithms with Scala",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bhim_P._Upadhyaya_-_Data_structures_and_algorithms_with_Scala.md",
                     "authors": "Bhim P. Upadhyaya",
                     "name": "Data structures and algorithms with Scala",
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
                     "title": "Bartosz Milewski - The dao of functional programming",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bartosz_Milewski_-_The_Dao_of_functional_programming.md",
                     "authors": "Bartosz Milewski",
                     "name": "The dao of functional programming",
                     "pages": 340
                   },
                   {
                     "status": "knowledge-base",
                     "title": "H. Abelson, G. J. Sussman, J. Sussman - Structure and interpretation of computer programs",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "H._Abelson,_G._J._Sussman,_J._Sussman_-_Structure_and_interpretation_of_computer_programs.md",
                     "authors": "H. Abelson, G. J. Sussman, J. Sussman",
                     "name": "Structure and Interpretation of computer programs",
                     "pages": 883
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Bartosz Milewski - Category theory for programmers",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Bartosz_Milewski_-_Category_theory_for_programmers.md",
                     "authors": "Bartosz Milewski",
                     "name": "Category theory for programmers",
                     "pages": 350
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Donald E. Knuth - The art of computer programming",
                     "type": "Book",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Donald_E._Knuth_-_The_art_of_computer_programming.md",
                     "authors": "Donald E. Knuth",
                     "name": "The art of computer programming",
                     "pages": 3799
                   }
                 ],
                 "courses": [
                   {
                     "status": "knowledge-base",
                     "title": "Algorithms, part II",
                     "type": "Course",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Algorithms,_part_II.md",
                     "platform": "Coursera",
                     "link": "https://www.coursera.org/learn/algorithms-part2",
                     "durationInMinutes": 1800
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Algorithms, part I",
                     "type": "Course",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Algorithms,_part_I.md",
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
                     "title": "Some history of functional programming languages",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Some_history_of_functional_programming_languages.md",
                     "author": "Some history of functional programming languages",
                     "platform": "YouTube",
                     "link": "https://www.youtube.com/watch?v=QVwm9jlBTik",
                     "durationInMinutes": 27
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Null references. The billion dollar mistake",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Null_references_The_billion_dollar_mistake.md",
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
                     "title": "MIT 6.001 Structure and interpretation",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "MIT_6.001_Structure_and_interpretation.md",
                     "author": "MIT",
                     "platform": "Youtube",
                     "link": "https://www.youtube.com/playlist?list=PLE18841CABEA24090",
                     "durationInMinutes": 1920
                   },
                   {
                     "status": "knowledge-base",
                     "title": "Functional programming group",
                     "type": "Video",
                     "section": "Programming",
                     "order": 999,
                     "startDate": "",
                     "dueDate": "",
                     "filePath": "Functional_programming_group.md",
                     "author": "Functional programming group",
                     "platform": "YouTube",
                     "link": "https://www.youtube.com/watch?app=desktop&v=s2ay9nEW3ak&list=PLNo5uJesLLQjRmM9lASwVeL0fFtJuKU0U",
                     "durationInMinutes": 120
                   }
                 ],
                 "exportedAt": "2025-08-06T07:00:04.970Z"
               }`
    }
];
