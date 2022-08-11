export function stripHtml(str: string) {
  return str.replace(/(<([^>]+)>)/gi, '');
}
