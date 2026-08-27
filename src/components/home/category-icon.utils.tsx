import React from 'react';
import {
  Wrench,
  Layers,
  Globe,
  Puzzle,
  Gamepad2,
  Sparkles,
  FlaskConical,
  Smartphone,
  Folder,
} from 'lucide-react';

/**
 * Resolves the appropriate Lucide icon for a software category based on name/slug.
 */
export function getCategoryIcon(slug: string, name: string): React.ReactNode {
  const normalized = (slug + ' ' + name).toLowerCase();

  if (
    normalized.includes('developer') ||
    normalized.includes('dev') ||
    normalized.includes('tool')
  ) {
    return <Wrench size={22} />;
  }
  if (normalized.includes('util') || normalized.includes('productiv')) {
    return <Layers size={22} />;
  }
  if (normalized.includes('web') || normalized.includes('cloud') || normalized.includes('online')) {
    return <Globe size={22} />;
  }
  if (
    normalized.includes('extension') ||
    normalized.includes('chrome') ||
    normalized.includes('plugin')
  ) {
    return <Puzzle size={22} />;
  }
  if (normalized.includes('game') || normalized.includes('gaming') || normalized.includes('play')) {
    return <Gamepad2 size={22} />;
  }
  if (
    normalized.includes('ai') ||
    normalized.includes('machine') ||
    normalized.includes('intelligence')
  ) {
    return <Sparkles size={22} />;
  }
  if (
    normalized.includes('experiment') ||
    normalized.includes('lab') ||
    normalized.includes('beta')
  ) {
    return <FlaskConical size={22} />;
  }
  if (
    normalized.includes('mobile') ||
    normalized.includes('ios') ||
    normalized.includes('android')
  ) {
    return <Smartphone size={22} />;
  }

  return <Folder size={22} />;
}
