import z from 'zod';

const trade = z.object({
    instrument: z.string(),
    quantity: z.number().int().nonnegative(),
    leverage: z.number().int().nonnegative()
});

export default trade;