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
