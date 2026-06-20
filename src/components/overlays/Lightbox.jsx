import { fromTo } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = fromTo('<!-- LIGHTBOX -->', '</div>');

export default function Lightbox() {
  return <LegacyHtml html={html} />;
}
