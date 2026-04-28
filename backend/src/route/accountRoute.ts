import express, { Request, Response } from 'express';

import { PrismaClient } from '../generated/prisma/client.js';
import { authMiddleware } from "../utils/middleware";
import accountZod from '../zod/accountZod.js';


const prisma = new PrismaClient();
const router = express.Router();

class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}


router.post('/update-balance', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }

        const result = accountZod.safeParse(req.body);
        
        if(result.success) {

            if(result.data.amount === 0) {
                return res.status(400).json({ message: "Invalid input" });
            }
            
            const amount = BigInt(result.data.amount);
            
            await prisma.$transaction(async (prisma) => {
                const userAccount = await prisma.account.findFirst({
                    where: {
                        user_id: userId
                    }
                });

                if(!userAccount) {
                    throw new ApiError(404, "Account not found");
                }
                if(userAccount.balance + amount < 0) {
                    throw new ApiError(400, "Account balance can't be negative.");
                }


                const updatedAccount = await prisma.account.update({
                    where: {
                        user_id: userId
                    }, 
                    data: {
                        balance: { increment: amount },
                        free_margin: { increment: amount }
                    }
                });


                await prisma.ledger_entry.create({
                    data: {
                        account_id: updatedAccount.id,
                        type: amount >= 0 ? "DEPOSIT" : "WITHDRAWAL",
                        amount: amount,
                        balance_after: updatedAccount.balance,
                    }
                });
            });

            return res.status(200).json({
                message: "Balance updated successfully."
            });

        } else {
            return res.status(400).json({
                message: "Invalid data zod",
                errors: result.error.message
            });
        }

    } catch(error: any) {
        if(error instanceof ApiError) {
            return res.status(error.status).json({ message: error.message });
        }

        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.get('/details', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }

        const account = await prisma.account.findUnique({
            where: {
                user_id: userId
            }
        });

        if(!account) {
            return res.status(404).json({ message: "Account does not exist" });
        } else {
            const accountData = {
                ...account,
                balance: account.balance.toString(),
                used_margin: account.used_margin.toString(),
                free_margin: account.free_margin.toString()
            }
            return res.status(200).json({ account: accountData });
        }

    } catch(error: any) {
        if(error instanceof ApiError) {
            return res.status(error.status).json({ message: error.message });
        }

        console.log("error:", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

export default router;