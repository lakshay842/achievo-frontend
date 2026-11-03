export function readParam(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  const first = Array.isArray(value) ? value[0] : undefined;
  return typeof first === 'string' && first.length > 0 ? first : null;
}
