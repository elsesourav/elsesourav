"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  formatDateTime,
  type AdminCustomFieldDefinition,
  type AdminCustomFieldValue,
  type CustomFieldEntity,
  type CustomFieldType,
} from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState, type FormEvent } from "react";

type AdminCustomFieldsClientProps = {
  initialDefinitions: AdminCustomFieldDefinition[];
  initialValues: AdminCustomFieldValue[];
};

type DefinitionFormState = {
  entity: CustomFieldEntity;
  key: string;
  label: string;
  description: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isActive: boolean;
  isFilterable: boolean;
  optionsJson: string;
  defaultValueJson: string;
};

type ValueFormState = {
  definitionId: string;
  entityId: string;
  valueJson: string;
};

const ENTITY_OPTIONS: CustomFieldEntity[] = [
  "APP",
  "CATEGORY",
  "CONTENT_PAGE",
  "POST",
  "HELP_ARTICLE",
  "PROFILE_PAGE",
  "TESTIMONIAL",
  "THEME_CONFIG",
  "STORE_BANNER",
  "STORE_SECTION_ITEM",
  "HOME_SLIDER",
  "APP_TAG",
  "POST_TAG",
  "HELP_CATEGORY",
  "APP_MEDIA",
  "APP_LINK",
  "USER",
];

const FIELD_TYPE_OPTIONS: CustomFieldType[] = [
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "BOOLEAN",
  "DATE",
  "URL",
  "JSON",
  "SELECT",
  "MULTISELECT",
];

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    ok?: boolean;
    error?: {
      message?: string;
    };
  };

  if (candidate.ok === false && candidate.error?.message) {
    return candidate.error.message;
  }

  return null;
}

function isApiSuccess<T>(
  payload: unknown,
): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as {
    ok?: boolean;
    data?: T;
  };

  return candidate.ok === true && "data" in candidate;
}

function toSortedDefinitions(
  items: AdminCustomFieldDefinition[],
): AdminCustomFieldDefinition[] {
  return [...items].sort((a, b) => {
    const entityDelta = a.entity.localeCompare(b.entity);
    if (entityDelta !== 0) {
      return entityDelta;
    }

    return a.key.localeCompare(b.key);
  });
}

function toSortedValues(
  items: AdminCustomFieldValue[],
): AdminCustomFieldValue[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }

    return a.entityId.localeCompare(b.entityId);
  });
}

function emptyDefinitionForm(entity: CustomFieldEntity): DefinitionFormState {
  return {
    entity,
    key: "",
    label: "",
    description: "",
    fieldType: "TEXT",
    isRequired: false,
    isActive: true,
    isFilterable: false,
    optionsJson: "",
    defaultValueJson: "",
  };
}

function emptyValueForm(definitionId = ""): ValueFormState {
  return {
    definitionId,
    entityId: "",
    valueJson: "",
  };
}

function formatJsonForEditor(value: unknown): string {
  if (value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatJsonInline(value: unknown): string {
  if (value === undefined) {
    return "-";
  }

  try {
    const serialized = JSON.stringify(value);
    if (!serialized) {
      return "-";
    }

    return serialized.length > 120
      ? `${serialized.slice(0, 117)}...`
      : serialized;
  } catch {
    return String(value);
  }
}

function parseOptionalJson(value: string):
  | {
      ok: true;
      value: unknown;
    }
  | {
      ok: false;
      message: string;
    } {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      ok: true,
      value: undefined,
    };
  }

  try {
    return {
      ok: true,
      value: JSON.parse(trimmed),
    };
  } catch {
    return {
      ok: false,
      message: "JSON syntax is invalid.",
    };
  }
}

function parseRequiredJson(value: string):
  | {
      ok: true;
      value: unknown;
    }
  | {
      ok: false;
      message: string;
    } {
  const parsed = parseOptionalJson(value);
  if (!parsed.ok) {
    return parsed;
  }

  if (parsed.value === undefined) {
    return {
      ok: false,
      message: "Value JSON is required.",
    };
  }

  return parsed;
}

function toDefinitionForm(
  definition: AdminCustomFieldDefinition,
): DefinitionFormState {
  return {
    entity: definition.entity,
    key: definition.key,
    label: definition.label,
    description: definition.description ?? "",
    fieldType: definition.fieldType,
    isRequired: definition.isRequired,
    isActive: definition.isActive,
    isFilterable: definition.isFilterable,
    optionsJson: formatJsonForEditor(definition.options),
    defaultValueJson: formatJsonForEditor(definition.defaultValue),
  };
}

function DefinitionFormFields({
  form,
  onChange,
  lockIdentity = false,
}: {
  form: DefinitionFormState;
  onChange: (next: DefinitionFormState) => void;
  lockIdentity?: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="custom-field-entity">Entity</Label>
        <select
          id="custom-field-entity"
          value={form.entity}
          onChange={(event) =>
            onChange({
              ...form,
              entity: event.target.value as CustomFieldEntity,
            })
          }
          disabled={lockIdentity}
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
        >
          {ENTITY_OPTIONS.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-field-type">Field type</Label>
        <select
          id="custom-field-type"
          value={form.fieldType}
          onChange={(event) =>
            onChange({
              ...form,
              fieldType: event.target.value as CustomFieldType,
            })
          }
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
        >
          {FIELD_TYPE_OPTIONS.map((fieldType) => (
            <option key={fieldType} value={fieldType}>
              {fieldType}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-field-key">Key</Label>
        <Input
          id="custom-field-key"
          value={form.key}
          onChange={(event) =>
            onChange({
              ...form,
              key: event.target.value,
            })
          }
          placeholder="release.channel"
          disabled={lockIdentity}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-field-label">Label</Label>
        <Input
          id="custom-field-label"
          value={form.label}
          onChange={(event) =>
            onChange({
              ...form,
              label: event.target.value,
            })
          }
          placeholder="Release channel"
        />
      </div>

      <div className="space-y-1.5 lg:col-span-2">
        <Label htmlFor="custom-field-description">Description</Label>
        <Input
          id="custom-field-description"
          value={form.description}
          onChange={(event) =>
            onChange({
              ...form,
              description: event.target.value,
            })
          }
          placeholder="Explain how this field should be used"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-field-options">Options JSON (optional)</Label>
        <textarea
          id="custom-field-options"
          rows={4}
          value={form.optionsJson}
          onChange={(event) =>
            onChange({
              ...form,
              optionsJson: event.target.value,
            })
          }
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
          placeholder='{"choices": ["stable", "beta", "nightly"]}'
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="custom-field-default">
          Default value JSON (optional)
        </Label>
        <textarea
          id="custom-field-default"
          rows={4}
          value={form.defaultValueJson}
          onChange={(event) =>
            onChange({
              ...form,
              defaultValueJson: event.target.value,
            })
          }
          className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
          placeholder='"stable"'
        />
      </div>

      <div className="flex flex-wrap gap-4 lg:col-span-2">
        <label className="inline-flex items-center gap-2 text-sm ui-text-primary">
          <input
            type="checkbox"
            checked={form.isRequired}
            onChange={(event) =>
              onChange({
                ...form,
                isRequired: event.target.checked,
              })
            }
          />
          Required value
        </label>

        <label className="inline-flex items-center gap-2 text-sm ui-text-primary">
          <input
            type="checkbox"
            checked={form.isFilterable}
            onChange={(event) =>
              onChange({
                ...form,
                isFilterable: event.target.checked,
              })
            }
          />
          Filterable in UI
        </label>

        <label className="inline-flex items-center gap-2 text-sm ui-text-primary">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              onChange({
                ...form,
                isActive: event.target.checked,
              })
            }
          />
          Active
        </label>
      </div>
    </div>
  );
}

function buildDefinitionPayload(form: DefinitionFormState):
  | {
      ok: true;
      payload: Record<string, unknown>;
    }
  | {
      ok: false;
      message: string;
    } {
  const key = form.key.trim().toLowerCase();
  const label = form.label.trim();
  const description = form.description.trim();

  if (key.length < 2) {
    return {
      ok: false,
      message: "Custom field key must be at least 2 characters.",
    };
  }

  if (label.length < 2) {
    return {
      ok: false,
      message: "Custom field label must be at least 2 characters.",
    };
  }

  const parsedOptions = parseOptionalJson(form.optionsJson);
  if (!parsedOptions.ok) {
    return {
      ok: false,
      message: `Options JSON: ${parsedOptions.message}`,
    };
  }

  const parsedDefault = parseOptionalJson(form.defaultValueJson);
  if (!parsedDefault.ok) {
    return {
      ok: false,
      message: `Default JSON: ${parsedDefault.message}`,
    };
  }

  const payload: Record<string, unknown> = {
    entity: form.entity,
    key,
    label,
    description,
    fieldType: form.fieldType,
    isRequired: form.isRequired,
    isActive: form.isActive,
    isFilterable: form.isFilterable,
  };

  if (parsedOptions.value !== undefined) {
    payload.options = parsedOptions.value;
  }

  if (parsedDefault.value !== undefined) {
    payload.defaultValue = parsedDefault.value;
  }

  return {
    ok: true,
    payload,
  };
}

export function AdminCustomFieldsClient({
  initialDefinitions,
  initialValues,
}: AdminCustomFieldsClientProps) {
  const dispatch = useAppDispatch();

  const [definitions, setDefinitions] = useState(() =>
    toSortedDefinitions(initialDefinitions),
  );
  const [values, setValues] = useState(() => toSortedValues(initialValues));
  const [createDefinitionForm, setCreateDefinitionForm] = useState(() =>
    emptyDefinitionForm(initialDefinitions[0]?.entity ?? ENTITY_OPTIONS[0]),
  );
  const [createValueForm, setCreateValueForm] = useState(() =>
    emptyValueForm(initialDefinitions[0]?.id ?? ""),
  );
  const [activeEntityFilter, setActiveEntityFilter] = useState<
    CustomFieldEntity | "ALL"
  >("ALL");
  const [valueDefinitionFilter, setValueDefinitionFilter] = useState("ALL");
  const [valueSearchEntityId, setValueSearchEntityId] = useState("");
  const [savingDefinition, setSavingDefinition] = useState(false);
  const [savingValue, setSavingValue] = useState(false);
  const [editingDefinition, setEditingDefinition] =
    useState<AdminCustomFieldDefinition | null>(null);
  const [editingDefinitionForm, setEditingDefinitionForm] =
    useState<DefinitionFormState | null>(null);
  const [updatingDefinition, setUpdatingDefinition] = useState(false);
  const [editingValue, setEditingValue] =
    useState<AdminCustomFieldValue | null>(null);
  const [editingValueJson, setEditingValueJson] = useState("");
  const [updatingValue, setUpdatingValue] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    kind: "definition" | "value";
    id: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visibleDefinitions = useMemo(() => {
    if (activeEntityFilter === "ALL") {
      return definitions;
    }

    return definitions.filter(
      (definition) => definition.entity === activeEntityFilter,
    );
  }, [activeEntityFilter, definitions]);

  const visibleValues = useMemo(() => {
    return values.filter((value) => {
      if (
        valueDefinitionFilter !== "ALL" &&
        value.definitionId !== valueDefinitionFilter
      ) {
        return false;
      }

      if (
        activeEntityFilter !== "ALL" &&
        value.definition.entity !== activeEntityFilter
      ) {
        return false;
      }

      if (valueSearchEntityId.trim().length > 0) {
        return value.entityId
          .toLowerCase()
          .includes(valueSearchEntityId.trim().toLowerCase());
      }

      return true;
    });
  }, [activeEntityFilter, valueDefinitionFilter, valueSearchEntityId, values]);

  function pushNotification(tone: "success" | "error", message: string): void {
    dispatch(
      enqueueNotification({
        tone,
        message,
      }),
    );
  }

  async function onCreateDefinition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const built = buildDefinitionPayload(createDefinitionForm);
    if (!built.ok) {
      pushNotification("error", built.message);
      return;
    }

    setSavingDefinition(true);

    try {
      const response = await fetch("/api/admin/custom-fields", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(built.payload),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCustomFieldDefinition>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ?? "Failed to create custom field.",
        );
        return;
      }

      setDefinitions((previous) =>
        toSortedDefinitions([...previous, payload.data]),
      );
      setCreateDefinitionForm(emptyDefinitionForm(createDefinitionForm.entity));
      setCreateValueForm((previous) =>
        previous.definitionId
          ? previous
          : {
              ...previous,
              definitionId: payload.data.id,
            },
      );
      pushNotification("success", `Created custom field ${payload.data.key}.`);
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to create custom field.",
      );
    } finally {
      setSavingDefinition(false);
    }
  }

  async function onCreateValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const definitionId = createValueForm.definitionId.trim();
    const entityId = createValueForm.entityId.trim();
    const parsedValue = parseRequiredJson(createValueForm.valueJson);

    if (!definitionId) {
      pushNotification("error", "Please select a custom field definition.");
      return;
    }

    if (!entityId) {
      pushNotification("error", "Entity id is required.");
      return;
    }

    if (!parsedValue.ok) {
      pushNotification("error", parsedValue.message);
      return;
    }

    setSavingValue(true);

    try {
      const response = await fetch("/api/admin/custom-fields/values", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          definitionId,
          entityId,
          value: parsedValue.value,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCustomFieldValue>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ?? "Failed to save custom field value.",
        );
        return;
      }

      setValues((previous) => {
        const withoutCurrent = previous.filter(
          (item) => item.id !== payload.data.id,
        );
        return toSortedValues([payload.data, ...withoutCurrent]);
      });
      setCreateValueForm((previous) => ({
        ...previous,
        valueJson: "",
      }));

      pushNotification("success", "Saved custom field value.");
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to save custom field value.",
      );
    } finally {
      setSavingValue(false);
    }
  }

  function onStartEditDefinition(definition: AdminCustomFieldDefinition): void {
    setEditingDefinition(definition);
    setEditingDefinitionForm(toDefinitionForm(definition));
  }

  function onStartEditValue(value: AdminCustomFieldValue): void {
    setEditingValue(value);
    setEditingValueJson(formatJsonForEditor(value.value));
  }

  async function onSaveDefinitionEdit() {
    if (!editingDefinition || !editingDefinitionForm) {
      return;
    }

    const built = buildDefinitionPayload(editingDefinitionForm);
    if (!built.ok) {
      pushNotification("error", built.message);
      return;
    }

    setUpdatingDefinition(true);

    try {
      const response = await fetch(
        `/api/admin/custom-fields/${editingDefinition.id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(built.payload),
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCustomFieldDefinition>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ?? "Failed to update custom field.",
        );
        return;
      }

      setDefinitions((previous) =>
        toSortedDefinitions(
          previous.map((item) =>
            item.id === editingDefinition.id ? payload.data : item,
          ),
        ),
      );
      setValues((previous) =>
        toSortedValues(
          previous.map((item) =>
            item.definitionId === editingDefinition.id
              ? {
                  ...item,
                  definition: {
                    ...item.definition,
                    entity: payload.data.entity,
                    key: payload.data.key,
                    label: payload.data.label,
                    fieldType: payload.data.fieldType,
                  },
                }
              : item,
          ),
        ),
      );

      pushNotification("success", `Updated custom field ${payload.data.key}.`);
      setEditingDefinition(null);
      setEditingDefinitionForm(null);
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to update custom field.",
      );
    } finally {
      setUpdatingDefinition(false);
    }
  }

  async function onSaveValueEdit() {
    if (!editingValue) {
      return;
    }

    const parsed = parseRequiredJson(editingValueJson);
    if (!parsed.ok) {
      pushNotification("error", parsed.message);
      return;
    }

    setUpdatingValue(true);

    try {
      const response = await fetch(
        `/api/admin/custom-fields/values/${editingValue.id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            value: parsed.value,
          }),
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<AdminCustomFieldValue>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ?? "Failed to update custom field value.",
        );
        return;
      }

      setValues((previous) =>
        toSortedValues(
          previous.map((item) =>
            item.id === editingValue.id ? payload.data : item,
          ),
        ),
      );

      pushNotification("success", "Updated custom field value.");
      setEditingValue(null);
      setEditingValueJson("");
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to update custom field value.",
      );
    } finally {
      setUpdatingValue(false);
    }
  }

  async function onDeleteConfirm() {
    if (!confirmDelete) {
      return;
    }

    setDeleting(true);

    try {
      const endpoint =
        confirmDelete.kind === "definition"
          ? `/api/admin/custom-fields/${confirmDelete.id}`
          : `/api/admin/custom-fields/values/${confirmDelete.id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !isApiSuccess<{ deleted: true }>(payload)) {
        pushNotification(
          "error",
          parseApiMessage(payload) ?? "Delete request failed.",
        );
        return;
      }

      if (confirmDelete.kind === "definition") {
        setDefinitions((previous) =>
          previous.filter((item) => item.id !== confirmDelete.id),
        );
        setValues((previous) =>
          previous.filter((item) => item.definitionId !== confirmDelete.id),
        );
        setCreateValueForm((previous) =>
          previous.definitionId === confirmDelete.id
            ? {
                ...previous,
                definitionId: "",
              }
            : previous,
        );
        pushNotification("success", "Deleted custom field definition.");
      } else {
        setValues((previous) =>
          previous.filter((item) => item.id !== confirmDelete.id),
        );
        pushNotification("success", "Deleted custom field value.");
      }

      setConfirmDelete(null);
    } catch (error) {
      pushNotification(
        "error",
        error instanceof Error ? error.message : "Delete request failed.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-4">
      <Card className="shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        <CardTitle>Create custom field definition</CardTitle>
        <CardDescription className="mt-1 text-xs">
          Define reusable metadata schema once and map values to any entity.
        </CardDescription>

        <form className="mt-4 space-y-4" onSubmit={onCreateDefinition}>
          <DefinitionFormFields
            form={createDefinitionForm}
            onChange={setCreateDefinitionForm}
          />

          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={savingDefinition}>
              {savingDefinition ? "Saving..." : "Create definition"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>Browse definitions</CardTitle>
        <CardDescription className="mt-1 text-xs">
          Filter by entity to keep large extension maps manageable.
        </CardDescription>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={activeEntityFilter === "ALL" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveEntityFilter("ALL")}
          >
            All entities
          </Button>
          {ENTITY_OPTIONS.map((entity) => (
            <Button
              key={entity}
              variant={activeEntityFilter === entity ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveEntityFilter(entity)}
            >
              {entity}
            </Button>
          ))}
        </div>
      </Card>

      <section className="grid gap-3">
        {visibleDefinitions.length === 0 ? (
          <Card className="border-dashed">
            <CardTitle>No custom field definitions</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Create your first definition to begin assigning extensible values.
            </CardDescription>
          </Card>
        ) : (
          visibleDefinitions.map((definition) => (
            <Card key={definition.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {definition.label}
                    <span className="ui-text-muted ml-2 text-xs font-normal">
                      {definition.entity}
                    </span>
                  </CardTitle>
                  {definition.description ? (
                    <CardDescription className="mt-1 text-xs">
                      {definition.description}
                    </CardDescription>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={definition.isActive ? "success" : "secondary"}>
                    {definition.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="secondary">{definition.fieldType}</Badge>
                  {definition.isRequired ? (
                    <Badge variant="secondary">Required</Badge>
                  ) : null}
                  {definition.isFilterable ? (
                    <Badge variant="outline">Filterable</Badge>
                  ) : null}
                </div>
              </div>

              <div className="ui-text-muted grid gap-1 text-xs">
                <p>Key: {definition.key}</p>
                <p>
                  Values linked:{" "}
                  {(definition._count?.values ?? 0).toLocaleString()}
                </p>
                <p>Updated: {formatDateTime(definition.updatedAt)}</p>
                <p>Options: {formatJsonInline(definition.options)}</p>
                <p>Default: {formatJsonInline(definition.defaultValue)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onStartEditDefinition(definition)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setConfirmDelete({
                      kind: "definition",
                      id: definition.id,
                      label: definition.label,
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      <Card className="shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        <CardTitle>Upsert custom field value</CardTitle>
        <CardDescription className="mt-1 text-xs">
          One value per definition and entity id pair.
        </CardDescription>

        <form className="mt-4 grid gap-3" onSubmit={onCreateValue}>
          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-definition">Definition</Label>
            <select
              id="custom-field-value-definition"
              value={createValueForm.definitionId}
              onChange={(event) =>
                setCreateValueForm((previous) => ({
                  ...previous,
                  definitionId: event.target.value,
                }))
              }
              className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Select definition</option>
              {definitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.entity} / {definition.key}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-entity-id">Entity id</Label>
            <Input
              id="custom-field-value-entity-id"
              value={createValueForm.entityId}
              onChange={(event) =>
                setCreateValueForm((previous) => ({
                  ...previous,
                  entityId: event.target.value,
                }))
              }
              placeholder="cm8x..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-json">Value JSON</Label>
            <textarea
              id="custom-field-value-json"
              rows={6}
              value={createValueForm.valueJson}
              onChange={(event) =>
                setCreateValueForm((previous) => ({
                  ...previous,
                  valueJson: event.target.value,
                }))
              }
              className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
              placeholder='"beta"'
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="default" disabled={savingValue}>
              {savingValue ? "Saving..." : "Save value"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle>Value filters</CardTitle>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-filter-definition">
              Definition
            </Label>
            <select
              id="custom-field-value-filter-definition"
              value={valueDefinitionFilter}
              onChange={(event) => setValueDefinitionFilter(event.target.value)}
              className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="ALL">All definitions</option>
              {definitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.entity} / {definition.key}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-filter-entity-id">
              Entity id
            </Label>
            <Input
              id="custom-field-value-filter-entity-id"
              value={valueSearchEntityId}
              onChange={(event) => setValueSearchEntityId(event.target.value)}
              placeholder="Search entity id"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-field-value-summary">Summary</Label>
            <Input
              id="custom-field-value-summary"
              value={`${visibleValues.length.toLocaleString()} visible values`}
              readOnly
            />
          </div>
        </div>
      </Card>

      <section className="grid gap-3">
        {visibleValues.length === 0 ? (
          <Card className="border-dashed">
            <CardTitle>No custom field values yet</CardTitle>
            <CardDescription className="mt-1 text-xs">
              Save values to bind custom definitions to entity records.
            </CardDescription>
          </Card>
        ) : (
          visibleValues.map((value) => (
            <Card key={value.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{value.definition.label}</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {value.definition.entity} / {value.definition.key}
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline">{value.definition.fieldType}</Badge>
                </div>
              </div>

              <div className="ui-text-muted grid gap-1 text-xs">
                <p>Entity id: {value.entityId}</p>
                <p>Updated: {formatDateTime(value.updatedAt)}</p>
                <p>Value: {formatJsonInline(value.value)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onStartEditValue(value)}
                >
                  Edit value
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setConfirmDelete({
                      kind: "value",
                      id: value.id,
                      label: value.definition.label,
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>

      <Modal
        open={Boolean(editingDefinition && editingDefinitionForm)}
        title="Edit custom field definition"
        description={
          editingDefinition
            ? `${editingDefinition.entity} / ${editingDefinition.key}`
            : undefined
        }
        onClose={() => {
          if (!updatingDefinition) {
            setEditingDefinition(null);
            setEditingDefinitionForm(null);
          }
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditingDefinition(null);
                setEditingDefinitionForm(null);
              }}
              disabled={updatingDefinition}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onSaveDefinitionEdit}
              disabled={updatingDefinition}
            >
              {updatingDefinition ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      >
        {editingDefinitionForm ? (
          <DefinitionFormFields
            form={editingDefinitionForm}
            onChange={setEditingDefinitionForm}
            lockIdentity
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(editingValue)}
        title="Edit custom field value"
        description={
          editingValue
            ? `${editingValue.definition.entity} / ${editingValue.definition.key} for ${editingValue.entityId}`
            : undefined
        }
        onClose={() => {
          if (!updatingValue) {
            setEditingValue(null);
            setEditingValueJson("");
          }
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditingValue(null);
                setEditingValueJson("");
              }}
              disabled={updatingValue}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onSaveValueEdit}
              disabled={updatingValue}
            >
              {updatingValue ? "Saving..." : "Save value"}
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <Label htmlFor="custom-field-edit-value">Value JSON</Label>
          <textarea
            id="custom-field-edit-value"
            rows={10}
            value={editingValueJson}
            onChange={(event) => setEditingValueJson(event.target.value)}
            className="ui-input w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={
          confirmDelete?.kind === "definition"
            ? "Delete custom field definition"
            : "Delete custom field value"
        }
        description={
          confirmDelete
            ? confirmDelete.kind === "definition"
              ? `Delete ${confirmDelete.label}? Linked values will also be removed.`
              : `Delete value for ${confirmDelete.label}?`
            : ""
        }
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => {
          if (!deleting) {
            setConfirmDelete(null);
          }
        }}
        onConfirm={onDeleteConfirm}
      />
    </section>
  );
}
