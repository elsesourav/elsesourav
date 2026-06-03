"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { Modal } from "@/components/ui/modal";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminHelpFaqsClient({ initialFaqs, categories = [] }: { initialFaqs: any[], categories?: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  
  useEffect(() => {
    setFaqs(initialFaqs);
  }, [initialFaqs]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answerMdx, setAnswerMdx] = useState("");
  const [orderIndex, setOrderIndex] = useState("0");
  const [categoryId, setCategoryId] = useState("");

  const openCreate = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswerMdx("");
    setOrderIndex("0");
    setCategoryId("");
    setIsCreating(true);
  };

  const openEdit = (faq: any) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswerMdx(faq.answerMdx);
    setOrderIndex(String(faq.orderIndex || 0));
    setCategoryId(faq.categoryId || "");
    setIsCreating(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editingFaq 
        ? `/api/admin/content/help/faqs/${editingFaq.id}` 
        : `/api/admin/content/help/faqs`;
      const method = editingFaq ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answerMdx,
          orderIndex: parseInt(orderIndex, 10),
          categoryId: categoryId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save FAQ");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setIsCreating(false);
      router.refresh();
      if (editingFaq) {
        setFaqs(faqs.map(f => f.id === editingFaq.id ? data.data : f));
      } else {
        setFaqs([...faqs, data.data]);
      }
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/content/help/faqs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete FAQ");
      return id;
    },
    onSuccess: (id) => {
      setFaqs(faqs.filter(f => f.id !== id));
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
            {editingFaq ? "Edit FAQ" : "Create New FAQ"}
          </h2>
          <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="ui-card p-4 rounded-xl border md:col-span-2">
            <label className="text-sm font-medium mb-2 block">Question</label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. How do I reset my password?" />
          </div>
          <div className="ui-card p-4 rounded-xl border">
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
          <div className="ui-card p-4 rounded-xl border">
            <label className="text-sm font-medium mb-2 block">Order Index</label>
            <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} />
          </div>
        </div>

        <div className="ui-card p-4 rounded-xl border" data-color-mode="light">
          <label className="text-sm font-medium mb-2 block text-text-primary">Answer MDX</label>
          <MDEditor
            value={answerMdx}
            onChange={(val) => setAnswerMdx(val || "")}
            height={250}
            className="w-full"
          />
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save FAQ"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create FAQ
        </Button>
      </div>
      
      {faqs.length === 0 ? (
        <div className="ui-card p-8 text-center text-text-muted rounded-xl border">
          No FAQs found. Create one to get started!
        </div>
      ) : (
        <div className="ui-card rounded-xl border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-elevated/50 text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-surface-hover/50">
                  <td className="px-4 py-3 font-medium text-text-primary">{faq.question}</td>
                  <td className="px-4 py-3 text-text-secondary">{faq.orderIndex}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}>
                        <Edit2 className="h-4 w-4 text-text-secondary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(faq.id)}>
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
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ? This action cannot be undone."
        confirmLabel="Delete"
        confirmTone="danger"
      />
    </div>
  );
}
