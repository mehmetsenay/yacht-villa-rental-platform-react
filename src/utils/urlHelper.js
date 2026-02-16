export const getBackendUrl = () => {
    return 'http://localhost:5001';
};

export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${getBackendUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
};
