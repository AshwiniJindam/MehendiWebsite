import { modalHtml } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = modalHtml();

export default function StudentModal() {
  return <LegacyHtml html={html} />;
}
