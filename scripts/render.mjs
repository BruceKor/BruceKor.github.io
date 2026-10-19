import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function renderMarkdown(markdown) {
  return sanitizeHtml(marked.parse(markdown, { gfm: true }), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'input', 'del'],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      code: ['class'],
      input: ['type', 'checked', 'disabled'],
      th: ['align'],
      td: ['align'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      input: (_, attrs) => ({
        tagName: 'input',
        attribs: { type: 'checkbox', disabled: '', ...('checked' in attrs ? { checked: '' } : {}) },
      }),
    },
    exclusiveFilter: frame => frame.tag === 'img' && !/^(?:https?:\/\/|\/[^/])/.test(frame.attribs.src || ''),
  });
}
