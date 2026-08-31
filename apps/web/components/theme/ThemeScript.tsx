/**
 * Blocking inline script that runs before first paint.
 * Reads the user's theme preference from URL params or localStorage and applies
 * the correct class/attribute to <html> to prevent flash of wrong theme.
 *
 * This is a Server Component that renders a <script> tag.
 */
export function ThemeScript() {
  const themeScript = `(function(){try{var urlParams=new URLSearchParams(window.location.search);var qTheme=urlParams.get('theme');var t=qTheme||localStorage.getItem('theme');var d=document.documentElement;var c=d.classList;c.remove('dark','light');if(t==='light'){c.add('light');d.setAttribute('data-theme','light')}else if(t==='system'){var m=window.matchMedia('(prefers-color-scheme:dark)').matches;c.add(m?'dark':'light');d.setAttribute('data-theme',m?'dark':'light')}else{c.add('dark');d.setAttribute('data-theme','dark')}}catch(e){d.classList.add('dark');d.setAttribute('data-theme','dark')}})();`;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />;
}
