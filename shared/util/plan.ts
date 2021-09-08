/**
 * @format
 */

export function isPro(plan?: string) {
  if (!plan) {
    return false;
  }

  return ['pro', 'enterprise'].includes(plan);
}
