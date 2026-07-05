// Prefix root-relative paths ("/services", "/images/x.png") with the
// configured base path so the site works both at medeon.ai (base "/")
// and at username.github.io/medeon-site (base "/medeon-site").
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return path;
  return base + path;
}
