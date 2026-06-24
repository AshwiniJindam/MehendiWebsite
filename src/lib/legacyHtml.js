import originalHtml from '../../legacy.html?raw';

export const legacyStyle = (originalHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '') + '\n.status-lost{background:#ffebee;color:#c62828;}';
export const legacyBody = originalHtml.match(/<body[^>]*>([\s\S]*?)<script>/)?.[1] ?? '';

export function between(start, end) {
  const startIndex = legacyBody.indexOf(start);
  if (startIndex < 0) return '';
  const endIndex = legacyBody.indexOf(end, startIndex);
  if (endIndex < 0) return '';
  return legacyBody.slice(startIndex, endIndex);
}

export function fromTo(start, end) {
  const startIndex = legacyBody.indexOf(start);
  if (startIndex < 0) return '';
  const endIndex = legacyBody.indexOf(end, startIndex);
  if (endIndex < 0) return '';
  return legacyBody.slice(startIndex, endIndex + end.length);
}

export function modalHtml() {
  return between('<!-- MODAL -->', '<script>').trim();
}

export function page(marker, nextMarker) {
  return between(`<!-- ===== ${marker} ===== -->`, nextMarker)
    .trim()
    .replace('class="page"', 'class="page active"');
}
