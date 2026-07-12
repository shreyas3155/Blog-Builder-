'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogEditor } from '@/components/editor/BlogEditor';
import { slugify } from '@/lib/utils';
import { Upload, X, Eye, FileText, CheckCircle, Save, Sparkles, RefreshCw } from 'lucide-react';
import { useAlert } from '@/providers/AlertProvider';

export function BlogForm({ initialData, onSave, isSaving }) {
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);
  
  // 1. Form States
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialData?.tags?.map((t) => t.name) || []);
  
  const [uploadingCover, setUploadingCover] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved
  const [hasDraftToRestore, setHasDraftToRestore] = useState(false);

  // Fetch categories from DB for dropdown selection
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
  const categories = categoriesData?.categories || [];

  // Generate slug dynamically from title unless customized
  const handleTitleChange = (val) => {
    setTitle(val);
    // Only auto-update slug if not manually edited yet
    if (!initialData?.slug) {
      setSlug(slugify(val));
    }
  };

  // 2. Cover image upload trigger
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        showAlert(errData.message || 'Cover upload failed.', 'error');
        return;
      }

      const data = await res.json();
      setCoverImage(data.url);
    } catch (err) {
      console.error(err);
      showAlert('Error uploading cover image.', 'error');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // 3. Tag inputs manager
  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // 4. Local Storage Auto-save feature
  const getDraftKey = () => `BlogBuilder-draft-${initialData?.id || 'new'}`;

  // Check if a newer local storage draft exists on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(getDraftKey());
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // If the draft title or content differs and is newer, prompt user
        if (
          parsed.title !== title ||
          parsed.content !== content ||
          parsed.excerpt !== excerpt
        ) {
          setHasDraftToRestore(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [initialData?.id]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!title && !content) return;

    setAutoSaveStatus('saving');
    const delayDebounce = setTimeout(() => {
      const draftPayload = {
        title,
        slug,
        excerpt,
        coverImage,
        categoryId,
        content,
        tags,
        updatedAt: Date.now(),
      };
      localStorage.setItem(getDraftKey(), JSON.stringify(draftPayload));
      setAutoSaveStatus('saved');
    }, 2000); // Trigger save 2 seconds after last keystroke

    return () => clearTimeout(delayDebounce);
  }, [title, slug, excerpt, coverImage, categoryId, content, tags]);

  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(getDraftKey());
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setSlug(parsed.slug || '');
        setExcerpt(parsed.excerpt || '');
        setCoverImage(parsed.coverImage || '');
        setCategoryId(parsed.categoryId || '');
        setContent(parsed.content || '');
        setTags(parsed.tags || []);
        setHasDraftToRestore(false);
      }
    } catch (e) {
      showAlert('Failed to restore draft.', 'error');
    }
  };

  const clearLocalDraft = () => {
    localStorage.removeItem(getDraftKey());
    setHasDraftToRestore(false);
  };

  const handleFormSubmit = (e, publishedState) => {
    e.preventDefault();
    if (!title) { showAlert('Title is required.', 'warning'); return; }
    if (!categoryId) { showAlert('Please select a category.', 'warning'); return; }

    onSave({
      title,
      slug,
      excerpt,
      coverImage,
      categoryId,
      content,
      tags,
      published: publishedState,
    });

    // Clear local storage draft after successful save
    localStorage.removeItem(getDraftKey());
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Draft Restoration Banner */}
      {hasDraftToRestore && (
        <div className="col-span-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>We found an unsaved local draft that is newer than this version.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all"
            >
              Restore Draft
            </button>
            <button
              onClick={clearLocalDraft}
              className="px-3 py-1.5 border border-border/40 hover:bg-secondary/40 text-muted-foreground rounded-lg text-xs transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Left Column: Title, Editor, and Excerpt */}
      <form className="lg:col-span-8 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
        {/* Post Title */}
        <input
          type="text"
          placeholder="Untitled Article..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-3xl sm:text-4xl font-heading font-extrabold bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50 tracking-tight"
        />

        {/* Dynamic Slug Preview */}
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 -mt-2">
          <span className="font-bold">Slug preview:</span>
          <span className="bg-secondary/35 border border-border/30 px-2 py-0.5 rounded text-[11px] select-all font-mono">
            https://BlogBuilder.com/blogs/{slug || 'untitled-slug'}
          </span>
        </div>

        {/* Excerpt Summary input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Excerpt (Short Summary)</label>
          <textarea
            placeholder="Write a brief, catchy summary of this article for search results and cards..."
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={180}
            className="w-full p-4 bg-secondary/15 hover:bg-secondary/25 focus:bg-secondary/15 border border-border/40 focus:border-indigo-500 rounded-2xl text-sm outline-none resize-none transition-all"
          />
          <span className="text-[10px] text-right text-muted-foreground">
            {excerpt.length}/180 characters
          </span>
        </div>

        {/* TipTap Rich Text Editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Article Content</label>
          <BlogEditor initialContent={content} onChange={setContent} />
        </div>
      </form>

      {/* Right Column: Meta widgets & Publish panel */}
      <aside className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Publish Options Panel */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="font-heading font-extrabold text-sm">Publish Control</h3>
            
            {/* Auto-save status Indicator */}
            {autoSaveStatus === 'saving' && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Auto-saved
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-2">
            <p><strong>Status:</strong> {initialData?.published ? 'Published' : 'Draft'}</p>
            <p><strong>Last Saved:</strong> {initialData?.updatedAt ? new Date(initialData.updatedAt).toLocaleTimeString('en-US') : 'Not saved yet'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={(e) => handleFormSubmit(e, false)}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl text-xs border border-border transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
            <button
              onClick={(e) => handleFormSubmit(e, true)}
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Publish Post
            </button>
          </div>
        </div>

        {/* Cover Image Upload widget */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Image</h4>
          
          {coverImage ? (
            <div className="relative group aspect-video rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
              <img src={coverImage} alt="Cover image" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition-all duration-200"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-border/50 hover:border-indigo-500/50 hover:bg-secondary/10 text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-2 transition-all p-4 cursor-pointer disabled:opacity-50"
            >
              {uploadingCover ? (
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
              <span className="text-xs font-semibold">Upload cover photo</span>
              <span className="text-[10px] opacity-75">Recomended: 1200 x 630 px</span>
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Category & Tags selector */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categorization</h4>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 bg-secondary/30 border border-border/40 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all text-foreground"
            >
              <option value="">Select a Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Pills Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground">Tags</label>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="w-full p-2.5 bg-secondary/30 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
            />
            {/* Tags list pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border/60 text-foreground text-[10px] font-semibold rounded-lg"
                >
                  {t}
                  <button onClick={() => removeTag(idx)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Google SEO Preview */}
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Google SEO Preview
          </h4>
          <div className="p-4 bg-secondary/15 border border-border/30 rounded-xl flex flex-col gap-1 text-left select-none font-sans leading-normal">
            <span className="text-[11px] text-muted-foreground truncate font-mono">
              https://BlogBuilder.com › blogs › {slug || 'untitled-slug'}
            </span>
            <span className="text-sm font-medium text-blue-500 dark:text-blue-400 truncate hover:underline cursor-pointer">
              {title || 'Untitled Post - Write a Title'} | BlogBuilder
            </span>
            <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
              {excerpt || 'Write an article excerpt to display as the meta description in search engine results.'}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
