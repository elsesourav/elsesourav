"use client";

import { Button } from "@/components/ui/button";
import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
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
import { ArrowDown, ArrowUp, Edit2, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";

interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  category: HelpCategory;
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
    id: category.id,
    data: { type: "Category", category },
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
      className="flex items-center justify-between p-3 mb-2 bg-surface border border-border-strong rounded-md shadow-sm group"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-brand-accent"
        >
          <GripVertical className="h-5 w-5 text-text-muted" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-primary">
            {category.name}
          </h4>
          <p className="text-xs text-text-muted">
            {category.slug} {category.description && `• ${category.description}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveUp}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onMoveDown}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-status-error" />
        </Button>
      </div>
    </div>
  );
}

export function CategoryDndBoard({
  categories,
  onCategoriesChange,
  onEditCategory,
  onDeleteCategory,
}: {
  categories: HelpCategory[];
  onCategoriesChange: (categories: HelpCategory[]) => void;
  onEditCategory: (c: HelpCategory) => void;
  onDeleteCategory: (id: string) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      onCategoriesChange(arrayMove(categories, oldIndex, newIndex));
    }
  };

  const moveCategory = (categoryId: string, direction: 1 | -1) => {
    const idx = categories.findIndex((c) => c.id === categoryId);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx >= 0 && newIdx < categories.length) {
      onCategoriesChange(arrayMove(categories, idx, newIdx));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-surface-elevated p-4 rounded-xl border border-border-subtle shadow-sm">
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              onEdit={() => onEditCategory(category)}
              onDelete={() => onDeleteCategory(category.id)}
              onMoveUp={() => moveCategory(category.id, -1)}
              onMoveDown={() => moveCategory(category.id, 1)}
            />
          ))}
          {categories.length === 0 && (
            <div className="text-center text-text-muted text-sm py-8 italic">
              No categories found. Create one to get started.
            </div>
          )}
        </SortableContext>
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.4" } },
          }),
        }}
      >
        {activeId ? (
          <div className="bg-surface p-3 rounded-md shadow-lg border-2 border-brand-accent opacity-90 text-sm flex items-center gap-2">
            <GripVertical className="h-4 w-4" />
            Moving Category...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
