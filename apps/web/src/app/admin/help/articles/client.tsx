"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HelpDndBoard } from "./HelpDndBoard";

export function AdminHelpArticlesClient({ initialArticles, categories = [] }: { initialArticles: any[], categories?: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    setArticles(initialArticles);
    setHasUnsavedChanges(false);
  }, [initialArticles]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [categoryId, setCategoryId] = useState("");
  const [sections, setSections] = useState<any[]>([]);

  const openCreate = () => {
    setEditingArticle(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContentMarkdown("");
    setStatus("DRAFT");
    setCategoryId("");
    setSections([]);
    setIsCreating(true);
  };

  const openEdit = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    setSummary(article.summary || "");
    setContentMarkdown(article.contentMarkdown || article.contentMdx || "");
    setStatus(article.status || "DRAFT");
    setCategoryId(article.categoryId || "");
    setSections(article.sections || []);
    setIsCreating(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editingArticle 
        ? `/api/admin/content/help/articles/${editingArticle.id}` 
        : `/api/admin/content/help/articles`;
      const method = editingArticle ? "PUT" : "POST"; // admin.ts uses PUT for articles
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          summary: summary || undefined,
          contentMarkdown,
          contentMdx: contentMarkdown, // sync for now
          status,
          categoryId: categoryId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save Article");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsCreating(false);
      router.refresh();
      if (editingArticle) {
        setArticles(articles.map(a => a.id === editingArticle.id ? data.data : a));
      } else {
        setArticles([...articles, data.data]);
      }
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/help/articles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete Article");
      return id;
    },
    onSuccess: (id) => {
      setArticles(articles.filter(a => a.id !== id));
      router.refresh();
      setDeletingId(null);
    },
    onError: (err) => {
      alert(err.message);
      setDeletingId(null);
    },
  });

  const saveLayoutMutation = useMutation({
    mutationFn: async () => {
      // 1. Articles
      const articlePayload = articles.map((a, idx) => ({ id: a.id, orderIndex: idx, categoryId: a.categoryId }));
      const resArticles = await fetch(`/api/admin/content/help/articles/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articlePayload),
      });
      if (!resArticles.ok) throw new Error("Failed to save article layout");

      return { success: true };
    },
    onSuccess: () => {
      setHasUnsavedChanges(false);
      router.refresh();
    },
    onError: (err) => {
      alert("Failed to save layout: " + err.message);
    }
  });

  const handleArticlesChange = (newArticles: any[]) => {
    setArticles(newArticles);
    setHasUnsavedChanges(true);
  };


  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-heading">
            {editingArticle ? "Edit Article" : "Create New Article"}
          </h2>
          <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="ui-card p-4 rounded-xl border">
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How to install" />
          </div>
          <div className="ui-card p-4 rounded-xl border">
            <label className="text-sm font-medium mb-2 block">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. how-to-install" />
          </div>
          <div className="ui-card p-4 rounded-xl border md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="">No Category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ui-card p-4 rounded-xl border md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Summary</label>
            <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short description of this article" />
          </div>
          <div className="ui-card p-4 rounded-xl border md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="ui-card p-4 rounded-xl border" data-color-mode="light">
          <label className="text-sm font-medium mb-2 block text-text-primary">Content Markdown</label>
          <MDEditor
            value={contentMarkdown}
            onChange={(val) => setContentMarkdown(val || "")}
            height={400}
            className="w-full"
          />
        </div>

        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save Article"}
        </Button>
      </div>
    );
  }

    return (
      <div className="space-y-4">
        <div className="flex justify-end items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                setArticles(initialArticles);
                setHasUnsavedChanges(false);
              }} disabled={saveLayoutMutation.isPending}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => saveLayoutMutation.mutate()} disabled={saveLayoutMutation.isPending}>
                {saveLayoutMutation.isPending ? "Saving..." : "Save Layout"}
              </Button>
            </div>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </div>
        
        <HelpDndBoard 
          categories={categories}
          articles={articles}
          onArticlesChange={handleArticlesChange}
          onCategoriesChange={() => {}}
          onEditArticle={openEdit}
          onDeleteArticle={setDeletingId}
        />

        <ConfirmDialog
          open={!!deletingId}
          onCancel={() => setDeletingId(null)}
          onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
          title="Delete Article"
          description="Are you sure you want to delete this article? This action cannot be undone."
          confirmLabel="Delete"
          confirmTone="danger"
        />
      </div>
    );
}
