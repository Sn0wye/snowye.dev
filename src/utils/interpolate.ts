export const interpolate = (
  template: string,
  vars: Record<string, string | number>
): string => {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    String(vars[key] ?? `{${key}}`)
  );
};
