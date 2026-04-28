import z from 'zod';

const trade = z.object({
    instrument: z.string(),
    quantity: z.number().int().positive(),
    leverage: z.number().int().positive(),
    // side: z.enum(['LONG', 'SHORT'])
});

export default trade;