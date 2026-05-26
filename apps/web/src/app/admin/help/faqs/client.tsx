"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export function AdminHelpFaqsClient({ initialFaqs }: { initialFaqs: any[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [isCreating, setIsCreating] = useState(false);
  const [answerMdx, setAnswerMdx] = useState("");

  if (isCreating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-heading">Create New FAQ</h2>
          <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
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
        <Button>Save FAQ</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreating(true)}>
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
