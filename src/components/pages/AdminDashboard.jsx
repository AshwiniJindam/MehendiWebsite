import { page } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = page('ADMIN DASHBOARD', '<!-- MODAL -->');

export default function AdminDashboard() {
  return <LegacyHtml html={html} />;
}
