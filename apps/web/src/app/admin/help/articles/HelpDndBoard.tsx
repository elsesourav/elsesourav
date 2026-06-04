"use client";

import { Button } from "@/components/ui/button";
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryId: string | null;
  orderIndex: number;
}

interface HelpCategory {
  id: string;
  name: string;
  orderIndex: number;
}

function SortableArticleItem({
  article,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  article: HelpArticle;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: article.id,
    data: { type: "Article", article },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 mb-1.5 bg-surface-elevated border border-border-subtle rounded text-sm group hover:bg-surface-active/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-brand-accent p-1"
        >
          <GripVertical className="h-4 w-4 text-text-muted" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{article.title}</span>
          <span className="text-xs text-text-muted px-1.5 py-0.5 rounded-full bg-surface">
            {article.status}
          </span>
        </div>
      </div>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onEdit}
        >
          <Edit2 className="h-3.5 w-3.5 text-text-secondary" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 text-status-error" />
        </Button>
      </div>
    </div>
  );
}

function CategoryContainer({
  category,
  articles,
  onEditArticle,
  onDeleteArticle,
}: {
  category: HelpCategory | null;
  articles: HelpArticle[];
  onEditArticle: (a: HelpArticle) => void;
  onDeleteArticle: (id: string) => void;
}) {
  const isUncategorized = category === null;
  const categoryId = category?.id || "uncategorized";

  const { setNodeRef } = useSortable({
    id: categoryId,
    data: { type: "Category", category },
  });

  return (
    <div
      ref={setNodeRef}
      className="mb-4 bg-surface rounded-lg border border-border-strong overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-surface-hover border-b border-border-strong">
        <h3 className="text-sm font-semibold text-text-heading">
          {isUncategorized ? "Uncategorized Articles" : category.name}
        </h3>
        {!isUncategorized && (
          <span className="text-xs text-text-muted font-medium bg-surface px-1.5 py-0.5 rounded">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </span>
        )}
      </div>

      <div className="p-2 min-h-10">
        <SortableContext
          items={articles.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {articles.map((article) => (
            <SortableArticleItem
              key={article.id}
              article={article}
              onEdit={() => onEditArticle(article)}
              onDelete={() => onDeleteArticle(article.id)}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
            />
          ))}
        </SortableContext>
        {articles.length === 0 && (
          <div className="text-center text-text-muted text-xs py-3 italic border border-dashed border-border-subtle rounded bg-surface-active/10">
            Drag articles here
          </div>
        )}
      </div>
    </div>
  );
}

export function HelpDndBoard({
  categories,
  articles,
  onArticlesChange,
  onCategoriesChange,
  onEditArticle,
  onDeleteArticle,
}: {
  categories: HelpCategory[];
  articles: HelpArticle[];
  onArticlesChange: (articles: HelpArticle[]) => void;
  onCategoriesChange: (categories: HelpCategory[]) => void;
  onEditArticle: (a: HelpArticle) => void;
  onDeleteArticle: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"Category" | "Article" | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveType(active.data.current?.type);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (activeType === "Article") {
      const activeArticle = active.data.current?.article as HelpArticle;
      const overId = over.id;

      const overIsCategory = over.data.current?.type === "Category";
      const overIsArticle = over.data.current?.type === "Article";

      if (!overIsCategory && !overIsArticle) return;

      const overCategoryId = overIsCategory
        ? overId
        : over.data.current?.article.categoryId;
      const parsedOverCategoryId =
        overCategoryId === "uncategorized" ? null : overCategoryId;

      if (activeArticle.categoryId !== parsedOverCategoryId) {
        onArticlesChange(
          articles.map((a) => {
            if (a.id === activeArticle.id) {
              return { ...a, categoryId: parsedOverCategoryId };
            }
            return a;
          }),
        );
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);

    const { active, over } = event;
    if (!over) return;

    if (activeType === "Category" && over.data.current?.type === "Category") {
      if (active.id !== over.id) {
        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);
        onCategoriesChange(arrayMove(categories, oldIndex, newIndex));
      }
    }

    if (activeType === "Article" && over.data.current?.type === "Article") {
      if (active.id !== over.id) {
        const activeArticle = active.data.current?.article as HelpArticle;
        const overArticle = over.data.current?.article as HelpArticle;

        if (activeArticle.categoryId === overArticle.categoryId) {
          const catArticles = articles.filter(
            (a) => a.categoryId === activeArticle.categoryId,
          );
          const oldIndex = catArticles.findIndex((a) => a.id === active.id);
          const newIndex = catArticles.findIndex((a) => a.id === over.id);

          const newCatArticles = arrayMove(catArticles, oldIndex, newIndex);

          const newArticles = articles.map((a) => {
            if (a.categoryId === activeArticle.categoryId) {
              return newCatArticles.shift() || a;
            }
            return a;
          });
          onArticlesChange(newArticles);
        }
      }
    }
  };

  const getArticlesForCategory = (categoryId: string | null) => {
    return articles.filter((a) => a.categoryId === categoryId);
    // .sort((a, b) => a.orderIndex - b.orderIndex);
  };

  const uncategorizedArticles = getArticlesForCategory(null);

  const moveCategory = (categoryId: string, direction: 1 | -1) => {
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < categories.length) {
      onCategoriesChange(arrayMove(categories, idx, newIdx));
    }
  };

  const moveArticle = (articleId: string, direction: 1 | -1) => {
    const article = articles.find((a) => a.id === articleId);
    if (!article) return;
    const catArticles = getArticlesForCategory(article.categoryId);
    const idx = catArticles.findIndex((a) => a.id === articleId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < catArticles.length) {
      const newCatArticles = arrayMove(catArticles, idx, newIdx);
      const newArticles = articles.map((a) => {
        if (a.categoryId === article.categoryId) {
          return newCatArticles.shift() || a;
        }
        return a;
      });
      onArticlesChange(newArticles);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col">
        {categories.map((category) => (
          <CategoryContainer
            key={category.id}
            category={category}
            articles={getArticlesForCategory(category.id)}
            onEditArticle={onEditArticle}
            onDeleteArticle={onDeleteArticle}
          />
        ))}

        {uncategorizedArticles.length > 0 && (
          <CategoryContainer
            category={null}
            articles={uncategorizedArticles}
            onEditArticle={onEditArticle}
            onDeleteArticle={onDeleteArticle}
          />
        )}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.4" } },
          }),
        }}
      >
        {activeId && activeType === "Article" ? (
          <div className="bg-surface-elevated p-2 rounded shadow-lg border border-brand-accent opacity-90 text-sm">
            Moving Article...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
