import { describe, it, expect } from '@jest/globals';
import {
    formatQuantity,
    formatPrice,
    prettifyString,
    formatDate
} from './formatUtils';

describe('formatQuantity', () => {
    it.each([
        ['', '0'],
        ['0', '0'],
        ['00000000', '0'],
        ['100000000', '1'],
        ['150000000', '1.5'],
        ['12345678', '0.12345678'],
        ['-150000000', '-1.5'],
    ])('formats %s -> %s', (input, expected) => {
        expect(formatQuantity(input)).toBe(expected);
    });

    it('return "0" for non-numeric input', () => {
        expect(formatQuantity('abc')).toBe('0');
    });
});


describe('formatPrice' , () => {
    it('formats zero', () => {
        expect(formatPrice('0')).toBe('$0.00');
    });

    it('formats a positive micro-USD value with thousands separators', () => {
        expect(formatPrice('1234560000')).toMatch(/^\$[\d,]+\.\d{2}$/);
    });

    it('formats a negative vlue with leading minus', () => {
        expect(formatPrice('-100000000')).toMatch(/^-\$/);
    });
});


describe('prettifyString', () => {
    it('capitalizes words split on underscore', () => {
        expect(prettifyString('hello world')).toBe('Hello world');
        expect(prettifyString('BUY LIMIT')).toBe('Buy limit');
    });
});

describe('formatDate', () => {
    it('returns a human-readable US date', () => {
        const out = formatDate(new Date('2024-01-15T00:00:00Z'));
        expect(out).toMatch(/January/);
        expect(out).toMatch(/2024/);
    });
});