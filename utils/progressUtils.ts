export function calculateTaskProgress(content: string): number {
    const checkboxRegex = /- \[(x| )\]/g;
    const checkboxes = content.match(checkboxRegex) || [];
    if (checkboxes.length === 0) return 100;

    const completed = checkboxes.filter(cb => cb === '- [x]').length;
    return Math.round((completed / checkboxes.length) * 100) || 0;
}

export function generateProgressBar(progress: number): string {
    const filled = '🟩';
    const empty = '⬜';
    const totalBlocks = 50;
    const filledBlocks = Math.round(progress / 100 * totalBlocks);
    return filled.repeat(filledBlocks) + empty.repeat(totalBlocks - filledBlocks);
}
