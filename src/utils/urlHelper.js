export const getBackendUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    // Remove trailing slash
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Ensure it ends with /api
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${getBackendUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
};
