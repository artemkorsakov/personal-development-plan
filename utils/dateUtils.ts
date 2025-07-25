export function formatDate(dateStr: string): string {
    if (dateStr === "???") return dateStr;
    try {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
    } catch {
        return dateStr;
    }
}
