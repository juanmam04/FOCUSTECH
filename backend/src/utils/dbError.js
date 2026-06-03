export function isDuplicateKeyError(err) {
  return err?.code === '23505' || err?.code === 'ER_DUP_ENTRY';
}
