
export const prettifyString = (input: string): string => {
    return input
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export const formatDate = (date: Date): string => {
    const d = new Date(date);

    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(d);
}

export const formatDateTime = (date: Date): string => {
    const d = new Date(date);

    return new Intl.DateTimeFormat('en-US', {
        timeStyle: 'medium',
        dateStyle: 'long'
    }).format(d);
}
