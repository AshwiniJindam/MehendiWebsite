import { fromTo } from '../../lib/legacyHtml.js';
import LegacyHtml from '../common/LegacyHtml.jsx';

const html = fromTo('<!-- NAV -->', '</nav>');

export default function Navbar() {
  return <LegacyHtml html={html} />;
}
