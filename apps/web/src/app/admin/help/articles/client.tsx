"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export function AdminHelpArticlesClient({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [isCreating, setIsCreating] = useState(false);
  const [contentMdx, setContentMdx] = useState("");

  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-heading">Create New Article</h2>
          <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
        </div>
        <div className="ui-card p-4 rounded-xl border" data-color-mode="light">
          <label className="text-sm font-medium mb-2 block text-text-primary">MDX Content</label>
          <MDEditor
            value={contentMdx}
            onChange={(val) => setContentMdx(val || "")}
            height={400}
            className="w-full"
          />
        </div>
        <Button>Save Article</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
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
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-surface-hover/50">
                  <td className="px-4 py-3 font-medium text-text-primary">{article.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{article.slug}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
