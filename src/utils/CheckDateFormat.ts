export function isCorrectDateFormat(date: string | null): boolean {
    if (!date) return false
    const regex = /^\d{4}-\d{2}-\d{2}$/
    return regex.test(date)
}