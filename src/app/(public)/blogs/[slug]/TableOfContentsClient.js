'use client';

import { useEffect, useState } from 'react';
import { slugify } from '@/components/editor/TipTapRenderer';

export function TableOfContentsClient({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeHeading, setActiveHeading] = useState('');

  // Parse headings from TipTap JSON content
  useEffect(() => {
    if (!content) return;
    try {
      const doc = JSON.parse(content);
      const extracted = [];
      doc.content?.forEach((node) => {
        if (node.type === 'heading') {
          const text = node.content?.map((c) => c.text).join('') || '';
          if (text) {
            extracted.push({
              text,
              slug: slugify(text),
              level: node.attrs?.level || 1,
            });
          }
        }
      });
      setHeadings(extracted);
    } catch (e) {
      console.warn('Could not parse ToC headings:', e);
    }
  }, [content]);

  // Scroll spy — highlight the heading currently in view
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.slug))
        .filter(Boolean);

      const scrollPosition = window.scrollY + 200;

      let currentActive = '';
      for (const el of headingElements) {
        if (el.offsetTop <= scrollPosition) {
          currentActive = el.id;
        } else {
          break;
        }
      }

      if (!currentActive && headingElements[0]) {
        currentActive = headingElements[0].id;
      }
      setActiveHeading(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Table of Contents
      </h4>
      <nav className="flex flex-col gap-2.5 border-l border-border/60">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.slug}`}
            className={`text-xs pl-4 py-0.5 border-l -ml-px transition-all block ${
              activeHeading === h.slug
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            style={{ paddingLeft: `${(h.level - 1) * 12 + 16}px` }}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
