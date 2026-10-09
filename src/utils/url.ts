export function retirerBarreFinale(url: string): string {
  let fin = url.length;
  while (fin > 0 && url.charAt(fin - 1) === '/') {
    fin -= 1;
  }
  return url.slice(0, fin);
}
