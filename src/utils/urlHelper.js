export const getBackendUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    // Remove trailing slash
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Remove trailing /api to prevent double /api/api
    if (url.endsWith('/api')) {
        url = url.slice(0, -4);
    }
    return url;
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${getBackendUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
};
