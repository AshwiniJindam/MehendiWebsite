import { forwardRef, memo } from 'react';

const LegacyHtml = memo(
  forwardRef(function LegacyHtml({ html, ...props }, ref) {
    return <div ref={ref} {...props} dangerouslySetInnerHTML={{ __html: html }} />;
  })
);

export default LegacyHtml;
