import z from 'zod';

const instrumentZod = z.object({
    symbol:         z.string(),
    base_asset:     z.string(),
    quote_currency: z.enum(['USD']),
    is_active:      z.boolean(),
    max_leverage:   z.number(),
    min_quantity:   z.number(),
    fees_per_unit:  z.number()
});

const updateInstrumentZod = instrumentZod.partial();

export { instrumentZod , updateInstrumentZod};