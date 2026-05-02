import express, { Request, Response } from 'express';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { authMiddleware, roleMiddleware } from '../utils/middleware';
import { instrumentZod, updateInstrumentZod } from '../zod/instrumentZod';

const router = express.Router();
const prisma = new PrismaClient();


router.get('/active', authMiddleware, async (req: Request, res: Response) => {

    try {
        const instruments = await prisma.instrument.findMany({
            where: {
                is_active: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        const returnInstruments = instruments.map((input) => ({
            ...input,
            max_leverage: input.max_leverage.toString(),
            min_quantity: input.min_quantity.toString(),
            fees_per_unit: input.fees_per_unit.toString()
        }));
        
        console.log(returnInstruments);

        return res.status(200).json(returnInstruments);

    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.get('/', roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {

    try {
        const instruments = await prisma.instrument.findMany({});

        const returnInstruments = instruments.map((input) => ({
            ...input,
            max_leverage: input.max_leverage.toString(),
            min_quantity: input.min_quantity.toString(),
            fees_per_unit: input.fees_per_unit.toString()
        }));

        return res.status(200).json(returnInstruments);

    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.get('/:id', roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {

    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid instrument id" });
        }

        const instrument = await prisma.instrument.findUnique({
            where: {
                id: id
            }
        });

        console.log(instrument);

        if(!instrument) {
            return res.status(404).json({ message: "Instrument not found"});
        }

        const returnInstrument = {
            ...instrument,
            max_leverage: instrument.max_leverage.toString(),
            min_quantity: instrument.min_quantity.toString(),
            fees_per_unit: instrument.fees_per_unit.toString()
        };

        return res.status(200).json(returnInstrument);
    
    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/create', roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {
    try {

        const result = instrumentZod.safeParse(req.body);

        if(result.success) {
            
            await prisma.instrument.create({
                data: {
                    ...result.data,
                    quote_currency: result.data.quote_currency,
                    max_leverage: BigInt(result.data.max_leverage),
                    min_quantity: BigInt(result.data.min_quantity),
                    fees_per_unit: BigInt(result.data.fees_per_unit)
                }
            });

            return res.status(204).json({ 
                message: "Instrument created successfully"
            });

        } else {
            return res.status(400).json({ message: "Invalid data" });
        }
    
    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/update/:id', roleMiddleware(['ADMIN']), async (req: Request, res: Response) => {
    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid trade id" });
        }

        const result = updateInstrumentZod.safeParse(req.body);

        if(result.success) {
            const patch = result.data;

            const data: Prisma.instrumentUpdateInput = {};

            if (patch.symbol !== undefined) data.symbol = patch.symbol;
            if (patch.base_asset !== undefined) data.base_asset = patch.base_asset;
            if (patch.quote_currency !== undefined) data.quote_currency = patch.quote_currency;
            if (patch.is_active !== undefined) data.is_active = patch.is_active;
            if (patch.max_leverage !== undefined) data.max_leverage = BigInt(patch.max_leverage);
            if (patch.min_quantity !== undefined) data.min_quantity = BigInt(patch.min_quantity);
            if (patch.fees_per_unit !== undefined) data.fees_per_unit = BigInt(patch.fees_per_unit);

            await prisma.instrument.update({
                where: {
                    id: id
                },
                data
            });

            return res.status(204).json({ 
                message: "Instrument updated successfully"
            });

        } else {
            return res.status(400).json({ message: "Invalid data" });
        }
    
    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});


export default router;