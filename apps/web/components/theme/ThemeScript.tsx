/**
 * Blocking inline script that runs before first paint.
 * Reads the user's theme and visual effects fidelity preference from URL params,
 * localStorage, or server data-attributes, and applies them to <html>
 * to prevent flash of wrong theme or layout shifts.
 *
 * This is a Server Component that renders a <script> tag.
 */
export function ThemeScript({ initialEffects = 'high' }: { initialEffects?: string }) {
  const themeScript = `(function(){try{var u=new URLSearchParams(window.location.search);var qt=u.get('theme');var qe=u.get('effects');var t=qt||localStorage.getItem('theme');var d=document.documentElement;var serverEff=d.getAttribute('data-effects');var e=qe||serverEff||'${initialEffects}';try{localStorage.removeItem('effects_level')}catch(_e){}var c=d.classList;c.remove('dark','light');if(t==='light'){c.add('light');d.setAttribute('data-theme','light')}else if(t==='system'){var m=window.matchMedia('(prefers-color-scheme:dark)').matches;c.add(m?'dark':'light');d.setAttribute('data-theme',m?'dark':'light')}else{c.add('dark');d.setAttribute('data-theme','dark')}if(e==='low'||e==='medium'||e==='high'){d.setAttribute('data-effects',e)}else{d.setAttribute('data-effects','high')}}catch(err){var d=document.documentElement;d.classList.add('dark');d.setAttribute('data-theme','dark');d.setAttribute('data-effects','${initialEffects}')}})();`;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />;
}
