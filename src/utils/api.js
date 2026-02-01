// API utility with authentication
// Use authFetch instead of fetch() for authenticated API calls

export const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('token')
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            ...options.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    })
}

// Convenience methods
export const api = {
    get: (url) => authFetch(url).then(res => res.json()),

    post: (url, data) => authFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),

    patch: (url, data) => authFetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),

    put: (url, data) => authFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),

    delete: (url) => authFetch(url, {
        method: 'DELETE'
    }).then(res => res.json())
}

export default api
