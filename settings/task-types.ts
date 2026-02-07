export interface BaseTypeTask {
	status: string;
    title: string;
    type: string;
    section: string;
    order: number;
    startDate: string;
    dueDate: string;
    filePath: string;
}

export interface BookTask extends BaseTypeTask {
    authors: string;
    name: string;
    pages: number;
}

export interface ArticleTask extends BaseTypeTask {
    link: string;
    durationInMinutes: number;
}

export interface VideoTask extends BaseTypeTask {
	author: string;
	platform: string;
    link: string;
    durationInMinutes: number;
}

export interface PodcastTask extends BaseTypeTask {
	platform: string;
    link: string;
    episodes: number;
    durationInMinutes: number;
}

export interface CourseTask extends BaseTypeTask {
	platform: string;
    link: string;
    durationInMinutes: number;
}

export interface UserTypeTask extends BaseTypeTask {
    laborInputInHours: number;
}

export type TaskType =
    ArticleTask | BookTask | CourseTask | PodcastTask | UserTypeTask | VideoTask;

export const MAX_ORDER: number = 999;

export const MAX_ORDER_STR: string = '999';

