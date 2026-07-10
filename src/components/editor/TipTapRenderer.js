'use client';

import React from 'react';

// Simple helper to slugify headings for Table of Contents anchors
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export function TipTapRenderer({ content }) {
  if (!content) return null;

  let doc = null;
  try {
    doc = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (error) {
    // If parsing fails, fall back to rendering raw string as HTML or text
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) {
    return <p className="text-muted-foreground">Invalid content structure.</p>;
  }

  // Recursive parser function
  const renderNode = (node, index) => {
    if (!node) return null;

    // Helper to render node child text/marks
    const renderTextWithMarks = (textNode) => {
      if (!textNode || textNode.type !== 'text') return null;
      let element = textNode.text;

      if (Array.isArray(textNode.marks)) {
        // Sort marks to ensure consistent wrapping order
        textNode.marks.forEach((mark) => {
          if (mark.type === 'bold') {
            element = <strong key={mark.type}>{element}</strong>;
          } else if (mark.type === 'italic') {
            element = <em key={mark.type}>{element}</em>;
          } else if (mark.type === 'underline') {
            element = <u key={mark.type} className="decoration-indigo-500/40 decoration-2">{element}</u>;
          } else if (mark.type === 'code') {
            element = (
              <code key={mark.type} className="px-1.5 py-0.5 bg-secondary/50 rounded text-xs font-mono text-pink-500 border border-border/30">
                {element}
              </code>
            );
          } else if (mark.type === 'link') {
            element = (
              <a
                key={mark.type}
                href={mark.attrs?.href}
                target={mark.attrs?.target || '_blank'}
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/40 hover:decoration-indigo-300/80 transition-all font-medium"
              >
                {element}
              </a>
            );
          }
        });
      }

      return element;
    };

    const renderChildren = (children) => {
      if (!Array.isArray(children)) return null;
      return children.map((child, i) => {
        if (child.type === 'text') {
          return <React.Fragment key={i}>{renderTextWithMarks(child)}</React.Fragment>;
        }
        return renderNode(child, i);
      });
    };

    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="text-muted-foreground leading-relaxed text-base mb-5">
            {renderChildren(node.content)}
          </p>
        );

      case 'heading': {
        const level = node.attrs?.level || 1;
        const textContent = node.content?.map((c) => c.text).join('') || '';
        const id = slugify(textContent);
        const headingClasses = {
          1: 'text-3xl sm:text-4xl font-heading font-extrabold text-foreground mt-10 mb-5 tracking-tight',
          2: 'text-2xl sm:text-3xl font-heading font-bold text-foreground mt-8 mb-4 tracking-tight',
          3: 'text-xl sm:text-2xl font-heading font-bold text-foreground mt-6 mb-3 tracking-tight',
          4: 'text-lg sm:text-xl font-heading font-bold text-foreground mt-4 mb-2 tracking-tight',
        }[level] || 'text-xl font-bold text-foreground mt-6 mb-3';

        const Tag = `h${level}`;
        return (
          <Tag key={index} id={id} className={headingClasses}>
            {renderChildren(node.content)}
          </Tag>
        );
      }

      case 'blockquote':
        return (
          <blockquote
            key={index}
            className="pl-4 border-l-4 border-indigo-500 italic my-6 text-muted-foreground bg-secondary/15 py-3 pr-4 rounded-r-xl"
          >
            {renderChildren(node.content)}
          </blockquote>
        );

      case 'codeBlock': {
        const codeText = node.content?.map((c) => c.text).join('') || '';
        return (
          <pre
            key={index}
            className="bg-secondary/20 p-4 sm:p-5 rounded-2xl border border-border/50 overflow-x-auto my-6 shadow-inner font-mono text-sm leading-relaxed"
          >
            <code className="text-indigo-400">{codeText}</code>
          </pre>
        );
      }

      case 'bulletList':
        return (
          <ul key={index} className="list-disc pl-6 mb-5 space-y-2 text-muted-foreground">
            {renderChildren(node.content)}
          </ul>
        );

      case 'orderedList':
        return (
          <ol key={index} className="list-decimal pl-6 mb-5 space-y-2 text-muted-foreground">
            {renderChildren(node.content)}
          </ol>
        );

      case 'listItem':
        return <li key={index}>{renderChildren(node.content)}</li>;

      case 'horizontalRule':
        return <hr key={index} className="my-8 border-t border-border/40" />;

      case 'image':
        return (
          <div key={index} className="my-8 flex flex-col items-center">
            <img
              src={node.attrs?.src}
              alt={node.attrs?.alt || 'Image'}
              className="rounded-2xl border border-border/50 max-h-[500px] object-cover shadow-md"
            />
            {node.attrs?.alt && (
              <span className="text-xs text-muted-foreground mt-2 italic">{node.attrs.alt}</span>
            )}
          </div>
        );

      default:
        console.warn('Unhandled TipTap node type:', node.type);
        return null;
    }
  };

  return <div className="prose prose-indigo dark:prose-invert max-w-none">{doc.content.map(renderNode)}</div>;
}
