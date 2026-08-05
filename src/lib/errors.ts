export function getErrorMessage(error: unknown, fallback = '未知错误'): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error

  if (typeof error === 'object' && error !== null) {
    const candidate = error as {
      message?: unknown
      error_description?: unknown
      details?: unknown
      hint?: unknown
    }
    const message = [
      candidate.message,
      candidate.error_description,
      candidate.details,
      candidate.hint,
    ].find((value): value is string => typeof value === 'string' && value.trim().length > 0)

    if (message) return message
  }

  return fallback
}
