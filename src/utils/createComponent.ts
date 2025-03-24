export function createComponent() {
  return ({ customId }: { customId: string | RegExp }) => ({ customId });
}
