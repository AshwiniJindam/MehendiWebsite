import { page } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = page('ADMIN LOGIN', '<!-- ===== ADMIN DASHBOARD ===== -->');

export default function AdminLogin() {
  return <LegacyHtml html={html} />;
}
