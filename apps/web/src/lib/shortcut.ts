type Shortcut = {
  id: string;
  key: string;
  requireCtrlOrMeta?: boolean;
  requireAlt?: boolean;
  requireShift?: boolean;
  handler: (e: KeyboardEvent) => void;
};

const shortcuts = new Map<string, Shortcut>();
let mounted = false;

function handleKeydown(e: KeyboardEvent) {
  for (const [, sc] of shortcuts) {
    if (!e.key || !sc.key) continue;
    if (e.key.toLowerCase() !== sc.key.toLowerCase()) continue;

    if (sc.requireCtrlOrMeta && !(e.ctrlKey || e.metaKey)) continue;
    if (sc.requireAlt && !e.altKey) continue;
    if (sc.requireShift && !e.shiftKey) continue;

    try {
      sc.handler(e);
    } catch (err) {
      // swallow
    }
  }
}

export function registerShortcut(opts: {
  id: string;
  key: string;
  requireCtrlOrMeta?: boolean;
  requireAlt?: boolean;
  requireShift?: boolean;
  handler: (e: KeyboardEvent) => void;
}) {
  const { id } = opts;
  shortcuts.set(id, { ...opts, id });

  if (!mounted) {
    window.addEventListener("keydown", handleKeydown);
    mounted = true;
  }

  return () => {
    shortcuts.delete(id);
    if (shortcuts.size === 0 && mounted) {
      window.removeEventListener("keydown", handleKeydown);
      mounted = false;
    }
  };
}

export function unregisterShortcut(id: string) {
  shortcuts.delete(id);
  if (shortcuts.size === 0 && mounted) {
    window.removeEventListener("keydown", handleKeydown);
    mounted = false;
  }
}
