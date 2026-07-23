'use client';

import React from 'react';

/**
 * Parses inline markdown tokens: **bold**, *italic*, `code`, [text](url)
 */
function renderInline(text) {
  if (!text) return null;

  // Pattern matching: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith('*') && part.endsWith('*') && part.length > 2) || (part.startsWith('_') && part.endsWith('_') && part.length > 2)) {
      return <em key={idx} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="bg-slate-200/70 text-slate-900 font-mono text-[12px] px-1.5 py-0.5 rounded border border-slate-300/50">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a key={idx} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline hover:text-blue-800">
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

/**
 * MarkdownRenderer component parses raw LLM markdown into formatted React elements
 * eliminating raw asterisks (*), hashtags (#), backticks (`), and bullet syntax.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split into lines to process block elements
  const lines = content.split(/\r?\n/);
  const elements = [];
  let inCodeBlock = false;
  let codeBlockBuffer = [];
  let listBuffer = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = (key) => {
    if (listBuffer.length === 0) return;
    if (listType === 'ul') {
      elements.push(
        <ul key={`ul-${key}`} className="list-disc list-inside space-y-1 my-2 pl-1 text-slate-800">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    } else if (listType === 'ol') {
      elements.push(
        <ol key={`ol-${key}`} className="list-decimal list-inside space-y-1 my-2 pl-1 text-slate-800">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    }
    listBuffer = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    // Code block toggle (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre key={`code-${index}`} className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[12px] my-2.5 overflow-x-auto border border-slate-800 shadow-inner">
            <code>{codeBlockBuffer.join('\n')}</code>
          </pre>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        flushList(index);
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('#')) {
      flushList(index);
      const match = line.match(/^(#+)\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        if (level === 1) {
          elements.push(<h1 key={index} className="text-base font-extrabold text-slate-900 mt-3 mb-1.5 tracking-tight border-b border-slate-200/60 pb-1">{renderInline(text)}</h1>);
        } else if (level === 2) {
          elements.push(<h2 key={index} className="text-sm font-bold text-slate-900 mt-2.5 mb-1">{renderInline(text)}</h2>);
        } else {
          elements.push(<h3 key={index} className="text-[13px] font-bold text-slate-800 mt-2 mb-1">{renderInline(text)}</h3>);
        }
        return;
      }
    }

    // Unordered List (- or *)
    const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ulMatch) {
      if (listType !== 'ul') flushList(index);
      listType = 'ul';
      listBuffer.push(ulMatch[1]);
      return;
    }

    // Ordered List (1., 2.)
    const olMatch = line.match(/^\s*\d+\.\s+(.*)$/);
    if (olMatch) {
      if (listType !== 'ol') flushList(index);
      listType = 'ol';
      listBuffer.push(olMatch[1]);
      return;
    }

    // Regular line / Paragraph
    flushList(index);
    if (line.trim().length === 0) {
      elements.push(<div key={`sp-${index}`} className="h-1.5" />);
    } else {
      elements.push(
        <p key={index} className="my-1 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });

  flushList('final');

  return <div className={`markdown-content ${className}`}>{elements}</div>;
}
