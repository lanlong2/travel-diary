export class EntityNotFoundError extends Error {
  constructor(entityName: string) {
    super(`${entityName}不存在或无权访问`)
    this.name = 'EntityNotFoundError'
  }
}

export function requireRow<T>(row: T | null, entityName: string): T {
  if (!row) throw new EntityNotFoundError(entityName)
  return row
}
