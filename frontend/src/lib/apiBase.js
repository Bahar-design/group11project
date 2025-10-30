// Provide a single source of truth for the API base URL.
// Resolution order:
// 1. window.__API_BASE__ (runtime override you can inject into the served index.html)
// 2. import.meta.env.VITE_API_BASE (build-time Vite variable)
// 3. empty string '' which makes requests relative to the current origin

const runtimeOverride = typeof window !== 'undefined' && window.__API_BASE__;
const buildTime = typeof import.meta !== 'undefined' ? import.meta.env.VITE_API_BASE : undefined;

const API_BASE = runtimeOverride || buildTime || '';

// Helpful debug log in the browser so we can see which value was selected at runtime
if (typeof window !== 'undefined' && typeof console !== 'undefined') {
	console.info('Resolved API_BASE =', API_BASE || '[relative origin]');
}

export default API_BASE;
