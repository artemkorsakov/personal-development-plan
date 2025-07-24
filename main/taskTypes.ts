export interface BookTask {
    type: string;
    authors: string;
    name: string;
    pages: number;
    title: string;
    status: string;
    section: string;
    order: number;
    /** yyyy-MM-dd */
    startDate: string;
    /** yyyy-MM-dd */
    dueDate: string;
}
