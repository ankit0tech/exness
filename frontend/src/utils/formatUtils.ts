const SATS_PER_BTC_DECIMALS = 8;

const normalizeSignedIntegerString = (value: string): { negative: boolean; digits: string } | null => {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const negative = trimmed.startsWith("-");
    const unsigned = negative ? trimmed.slice(1) : trimmed;

    if (!/^\d+$/.test(unsigned)) return null;

    const digits = unsigned.replace(/^0+/, "") || "0";
    return { negative, digits };
};

const addThousandsSeparators = (digits: string): string => {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatQuantity = (input: string): string => {
    const parsed = normalizeSignedIntegerString(input);
    if (!parsed || parsed.digits === "0") {
        return "0";
    }

    const padded = parsed.digits.padStart(SATS_PER_BTC_DECIMALS + 1, "0");
    const wholeRaw = padded.slice(0, -SATS_PER_BTC_DECIMALS);
    const fractionRaw = padded.slice(-SATS_PER_BTC_DECIMALS);
    const fractionTrimmed = fractionRaw.replace(/0+$/, "");
    const whole = wholeRaw.replace(/^0+/, "") || "0";
    const sign = parsed.negative ? "-" : "";

    return fractionTrimmed ? `${sign}${whole}.${fractionTrimmed}` : `${sign}${whole}`;
};

export const formatPrice = (input: string): string => {
    const parsed = normalizeSignedIntegerString(input);
    if (!parsed || parsed.digits === "0") {
        return "$0.00";
    }

    const sign = parsed.negative ? "-" : "";
    const microValue = BigInt(parsed.digits);

    // Convert micro-USD to cents with round-half-up to avoid truncation drift.
    const cents = (microValue + 5_000n) / 10_000n;
    const dollars = cents / 100n;
    const centPart = (cents % 100n).toString().padStart(2, "0");
    const dollarsFormatted = addThousandsSeparators(dollars.toString());

    return `${sign}$${dollarsFormatted}.${centPart}`;
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
