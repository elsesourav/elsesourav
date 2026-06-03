"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminHelpArticlesClient({ initialArticles, categories = [] }: { initialArticles: any[], categories?: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  
  useEffect(() => {
    setArticles(initialArticles);
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
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Article
        </Button>
      </div>
      
      {articles.length === 0 ? (
        <div className="ui-card p-8 text-center text-text-muted rounded-xl border">
          No articles found. Create one to get started!
        </div>
      ) : (
        <div className="ui-card rounded-xl border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/50 text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Views</th>
                <th className="px-4 py-3 font-medium text-center">👍 / 👎</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-surface-hover/50">
                  <td className="px-4 py-3 font-medium text-text-primary">{article.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{article.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      article.status === 'PUBLISHED' 
                        ? 'bg-status-success/10 text-status-success' 
                        : article.status === 'DRAFT'
                        ? 'bg-status-warning/10 text-status-warning'
                        : 'bg-status-error/10 text-status-error'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary">{article.viewCount || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-status-success font-medium mr-2">👍 {article.upvotes || 0}</span>
                    <span className="text-status-error font-medium">👎 {article.downvotes || 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                        <Edit2 className="h-4 w-4 text-text-secondary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(article.id)}>
                        <Trash2 className="h-4 w-4 text-status-error" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
