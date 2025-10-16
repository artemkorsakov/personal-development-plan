import { ArticleTask, BookTask, CourseTask, PodcastTask, UserTypeTask, VideoTask } from '../settings/task-types';

export async function exportToJSON(
    articles: ArticleTask[],
    books: BookTask[],
    courses: CourseTask[],
    podcasts: PodcastTask[],
    userTypes: UserTypeTask[],
    videos: VideoTask[]
) {
    const data = {
        articles,
        books,
        courses,
        podcasts,
        userTypes,
        videos,
        exportedAt: new Date().toISOString()
    };

    const jsonStr = JSON.stringify(data, null, 2);

    // Create download link
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = createEl('a');
    a.setAttr('href', url);
    a.setAttr('download', `all-tasks-export-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
