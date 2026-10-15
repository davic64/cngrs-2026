export type Changes = Record<string, { from: unknown; to: unknown }>;

// Campos de `after` cuyo valor difiere del de `before`. `{}` si no hay cambios.
export function diffChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Changes {
  const changes: Changes = {};
  for (const key of Object.keys(after)) {
    if (before[key] !== after[key]) {
      changes[key] = { from: before[key], to: after[key] };
    }
  }
  return changes;
}
