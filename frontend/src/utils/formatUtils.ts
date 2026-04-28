

export const formatQuantity = (input: string): string => {
    const STATS_PER_BTC = 8;

    const padded = input.padStart(STATS_PER_BTC+1, "0");
    const whole  = padded.slice(0, -STATS_PER_BTC);
    const frac = padded.slice(-STATS_PER_BTC);
    const fracTrimmed = frac.replace(/0+$/, "");

    const result = fracTrimmed ? `${whole}.${fracTrimmed}` : whole;

    return result;
}

export const formatPrice = (input: string): string => {
    input = input.slice(0, -4);
    input = input.slice(0, -2) + "." + input.slice(-2);
    return Number(input).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
    });
}

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
