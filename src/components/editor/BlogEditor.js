'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Table as TableIcon,
  Image as ImageIcon,
  Link2,
  Undo2,
  Redo2,
  Grid3X3,
  Plus,
  Trash2
} from 'lucide-react';

export function BlogEditor({ initialContent, onChange }) {
  const fileInputRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);

  // Parse initial content
  const getParsedContent = () => {
    if (!initialContent) return '';
    try {
      return typeof initialContent === 'string' ? JSON.parse(initialContent) : initialContent;
    } catch (e) {
      return initialContent;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-400 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl border border-border/50 max-h-[500px] mx-auto shadow-md my-6',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-border w-full my-6 text-sm',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-secondary/35 p-2 font-bold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2',
        },
      }),
    ],
    content: getParsedContent(),
    onUpdate: ({ editor }) => {
      // Extract editor JSON
      const json = editor.getJSON();
      onChange(JSON.stringify(json));

      // Calculate stats
      const text = editor.getText();
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
      setWordCount(words);
      setReadingTime(Math.ceil(words / 225) || 1);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[350px] max-h-[600px] overflow-y-auto px-6 py-4 focus:outline-none bg-background text-foreground prose prose-indigo dark:prose-invert max-w-none text-sm md:text-base leading-relaxed',
      },
    },
  });

  // Sync content if initialContent changes after initial mount
  useEffect(() => {
    if (editor && initialContent) {
      const currentJson = JSON.stringify(editor.getJSON());
      if (initialContent !== currentJson) {
        try {
          editor.commands.setContent(JSON.parse(initialContent));
        } catch (e) {
          editor.commands.setContent(initialContent);
        }
      }
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  // Toolbar Actions
  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL Link:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || 'Image upload failed.');
        return;
      }

      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err) {
      console.error(err);
      alert('Network error uploading image.');
    } finally {
      // Clear file input
      e.target.value = '';
    }
  };

  const addImageUrl = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full border border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm focus-within:border-indigo-500/40 transition-colors">
      {/* 1. Menu Tool Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-border/40 bg-secondary/15 select-none">
        
        {/* Undo / Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Text Formats */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('bold')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('italic')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('underline')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('bulletList')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('orderedList')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Code blocks & Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('blockquote')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('codeBlock')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Links & Images */}
        <button
          onClick={toggleLink}
          className={`p-2 rounded-lg transition-all ${
            editor.isActive('link')
              ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
              : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
          }`}
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {/* Image insertion */}
        <button
          onClick={handleImageUploadClick}
          className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
          title="Upload Inline Image"
        >
          <ImageIcon className="w-4 h-4" />
          <Plus className="w-2.5 h-2.5 -ml-0.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="w-px h-6 bg-border/50 mx-1" />

        {/* Tables */}
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="p-2 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all"
          title="Insert 3x3 Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {editor.isActive('table') && (
          <div className="flex items-center gap-1 animate-in fade-in duration-200">
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="px-1.5 py-1 text-[10px] font-semibold bg-secondary border border-border/40 rounded hover:bg-secondary/70"
            >
              +Col Left
            </button>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-1 text-[10px] font-semibold bg-secondary border border-border/40 rounded hover:bg-secondary/70"
            >
              +Col Right
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="px-1.5 py-1 text-[10px] font-semibold bg-secondary border border-border/40 rounded hover:bg-secondary/70"
            >
              +Row Above
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-1 text-[10px] font-semibold bg-secondary border border-border/40 rounded hover:bg-secondary/70"
            >
              +Row Below
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20"
              title="Delete Table"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* 2. Text Editor Canvas */}
      <EditorContent editor={editor} />

      {/* 3. Editor Footer Stats */}
      <div className="flex items-center justify-between px-6 py-2.5 border-t border-border/40 bg-secondary/10 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{readingTime} min read</span>
        </div>
        <div>
          <span>TipTap Engine Active</span>
        </div>
      </div>
    </div>
  );
}
