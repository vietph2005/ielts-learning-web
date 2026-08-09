export const customFetch = (url: string, options: RequestInit = {}) => {
    const excludeUrls: string[] = [

    ];

    const shouldIncludeCredentials = !excludeUrls.some(excludeUrl => url.startsWith(excludeUrl));

    return fetch(url, {
        ...options,
        ...(shouldIncludeCredentials ? { credentials: "include" } : {}),
    });
};