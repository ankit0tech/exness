import z from 'zod';

const accountZod = z.object({
    amount: z.number().int()
});

export default accountZod;