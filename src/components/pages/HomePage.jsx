import { page } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = page('HOME PAGE', '<!-- ===== ADMISSION PAGE ===== -->');

export default function HomePage() {
  return <LegacyHtml html={html} />;
}
