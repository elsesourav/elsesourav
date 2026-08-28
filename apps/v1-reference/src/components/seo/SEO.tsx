import React from 'react';
import type { SEOConfig } from '@/types/seo.types';
import { useSEO } from '@/hooks/useSEO';

export type SEOProps = SEOConfig;

export const SEO: React.FC<SEOProps> = (props) => {
  useSEO(props);
  return null;
};
