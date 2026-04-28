import express, { Request, Response } from "express";
import tradeZod from "../zod/tradeZod";
// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from '../generated/prisma/client.js';
import { authMiddleware } from "../utils/middleware";

const prisma = new PrismaClient();
const router = express.Router();
const tickerApi = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
const SATS_PER_BTC = 100_000_000n;

const decimalToScaledBigInt = (value: string, scale: number): bigint => {
    const [intPart = "", decPartRaw=""] = value.split(".");
    const decPart = (decPartRaw + "0".repeat(scale)).slice(0, scale);
    const sign = intPart.startsWith("-") ? -1n : 1n;
    const absInt = intPart.replace("-", "");
    
    return sign * (BigInt(absInt || "0") * 10n ** BigInt(scale) + BigInt(decPart || "0"));
}

class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

router.post('/create/long', authMiddleware, async (req: Request, res: Response) => {
    
    try {
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }
        
        const result = tradeZod.safeParse(req.body);
        
        if(result.success) {
            
            const reqQuantity = BigInt(result.data.quantity);
            const reqLeverage = BigInt(result.data.leverage);

            const response = await fetch(tickerApi);
            if(!response.ok) {
                throw new Error(`Error fetching data`);
            }
            
            const data = await response.json();
            const price = decimalToScaledBigInt(data.price, 6);     // price of 1 BTC

            const calculateMargin = (quantity: bigint, leverage: bigint): bigint => {
                return (quantity * price) / SATS_PER_BTC / leverage;
            }
            const calculateFees = (quantity: bigint, fees_per_unit: bigint): bigint => {
                return quantity * fees_per_unit / SATS_PER_BTC;
            }
        
            // $2 pee BTC => 20,00,000
            const instrument = await prisma.instrument.findUnique({
                where: {
                    symbol: result.data.instrument
                },
                select: {
                    id: true,
                    fees_per_unit: true,
                    max_leverage: true
                }
            });
            
            if(!instrument) {
                return res.status(400).json({ message: "Invalid data" });
            }
            
            const required_margin = calculateMargin(reqQuantity, reqLeverage);
            const fees = calculateFees(reqQuantity, instrument.fees_per_unit);
            
            
            await prisma.$transaction(async (prisma) => {
                const account = await prisma.account.findUnique({
                    where: {
                        user_id: userId
                    },
                    select: {
                        id: true,
                        free_margin: true
                    }
                });
                
                if(!account) {
                    throw new ApiError(400, "Invalid data");
                }
                
                if(required_margin > account.free_margin) {
                    throw new ApiError(400, "Your account don't have enough margin");
                }

                if(reqLeverage > instrument.max_leverage) {
                    throw new ApiError(400, "Leverage requested is higher that max available leverage");
                }

                const createdTrade = await prisma.trade.create({
                    data: {
                        user_id: userId,
                        account_id: account.id,
                        instrument_id: instrument.id,
                        side: 'LONG',
                        quantity: reqQuantity,
                        leverage: reqLeverage,
                        entry_price: price,
                        notional: reqQuantity * price / SATS_PER_BTC,
                        margin_used: required_margin,
                        fees: fees
                    }
                });
                
                const userAccount = await prisma.account.update({
                    where: {
                        user_id: userId
                    },
                    data: {
                        used_margin: { increment: required_margin },
                        free_margin: { decrement: required_margin - BigInt(fees) },
                        balance: { decrement: fees}
                    }
                });
                
                await prisma.ledger_entry.create({
                    data: {
                        account_id: userAccount.id,
                        trade_id: createdTrade.id,
                        type: "FEE",
                        amount: fees,
                        balance_after: userAccount.balance,
                    }
                });
            });
            
            return res.status(200).json({
                message: "Trade executed successfully"
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

router.post('/close/long/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid trade id" });
        }
        
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }

        const response = await fetch(tickerApi);
        if(!response.ok) {
            throw new Error(`Error fetching data`);
        }
        
        const data = await response.json();
        const current_price = decimalToScaledBigInt(data.price, 6);     // price of 1 BTC

        // calculate PnL, margin
        // update account with PnL and margin
        // create ledger entry

        await prisma.$transaction(async (prisma) => {

            const trade = await prisma.trade.findFirst({
                where: {
                    id: Number(id),
                    user_id: userId,
                    side: "LONG"
                }
            });

            if(!trade || trade.status !== 'OPEN') {
                throw new Error('Requested trade does not exist or already closed');
            }
            
            const entry_price = trade.entry_price;
            const pnl = (current_price - entry_price) * trade.quantity / SATS_PER_BTC;

            const account = await prisma.account.update({
                where: {
                    user_id: userId
                },
                data: {
                    balance: { increment: pnl },
                    used_margin: { decrement: trade.margin_used },
                    free_margin: { increment: trade.margin_used + pnl }
                }
            });

            const updatedTrade = await prisma.trade.update({
                where: {
                    id: trade.id
                },
                data: {
                    status: 'CLOSED',
                    exit_price: current_price,
                    exit_time: new Date(),
                    realized_pnl: pnl
                }
            });


            await prisma.ledger_entry.create({
                data: {
                    account_id: account.id,
                    trade_id: trade.id,
                    type: "TRADE_PNL",
                    amount: pnl,
                    balance_after: account.balance,
                }  
            });
        });

        console.log("sell order executed successfully");
        
        return res.status(200).json({ message: "sell order executed successfully"});

    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.post('/create/short', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }
        console.log(req.body);
        
        const result = tradeZod.safeParse(req.body);
        
        if(result.success) {
            const reqQuantity = BigInt(result.data.quantity);
            const reqLeverage = BigInt(result.data.leverage);
            
            const response = await fetch(tickerApi);
            if(!response.ok) {
                throw new Error(`Error fetching data`);
            }

            const data = await response.json();
            const price = decimalToScaledBigInt(data.price, 6);     // price of 1 BTC

            const calculateMargin = (quantity: bigint, leverage: bigint): bigint => {
                return (quantity * price) / SATS_PER_BTC / leverage;
            }
            const calculateFees = (quantity: bigint, fees_per_unit: bigint): bigint => {
                return quantity * fees_per_unit / SATS_PER_BTC;
            }

            const instrument = await prisma.instrument.findUnique({
                where: {
                    symbol: result.data.instrument
                },
                select: {
                    id: true,
                    fees_per_unit: true,
                    max_leverage: true
                }
            });

            if(!instrument) {
                return res.status(400).json({ message: "Invalid data" });
            }

            const required_margin = calculateMargin(reqQuantity, reqLeverage);
            const fees = calculateFees(reqQuantity, instrument.fees_per_unit);

            await prisma.$transaction(async (prisma) => {
                const account = await prisma.account.findUnique({
                    where: {
                        user_id: userId
                    },
                    select: {
                        id: true,
                        free_margin: true
                    }
                });
                
                if(!account) {
                    throw new ApiError(400, "Invalid data");
                }
                
                if(required_margin > account.free_margin) {
                    throw new ApiError(400, "Your account don't have enough margin");
                }

                if(reqLeverage > instrument.max_leverage) {
                    throw new ApiError(400, "Leverage requested is higher that max available leverage");
                }

                const createdTrade = await prisma.trade.create({
                    data: {
                        user_id: userId,
                        account_id: account.id,
                        instrument_id: instrument.id,
                        side: 'SHORT',
                        quantity: reqQuantity,
                        leverage: reqLeverage,
                        entry_price: price,
                        notional: reqQuantity * price / SATS_PER_BTC,
                        margin_used: required_margin,
                        fees: fees
                    }
                });
                
                const userAccount = await prisma.account.update({
                    where: {
                        user_id: userId
                    },
                    data: {
                        used_margin: { increment: required_margin },
                        free_margin: { decrement: required_margin - BigInt(fees) },
                        balance: { decrement: fees}
                    }
                });
                
                await prisma.ledger_entry.create({
                    data: {
                        account_id: userAccount.id,
                        trade_id: createdTrade.id,
                        type: "FEE",
                        amount: fees,
                        balance_after: userAccount.balance,
                    }
                });
            });

            console.log("Trade executed successfully");
            
            return res.status(200).json({
                message: "Trade executed successfully"
            });

        } else {
            return res.status(400).json({
                message: "Invalid data zod",
                errors: result.error.message
            });
        }
    } catch (error: any) {
        if(error instanceof ApiError) {
            return res.status(error.status).json({ message: error.message });
        }

        console.log("error:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.post('/close/short/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        console.log(req.params.id);
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid trade id" });
        }
        
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }

        const response = await fetch(tickerApi);
        if(!response.ok) {
            throw new Error(`Error fetching data`);
        }
        
        const data = await response.json();
        const current_price = decimalToScaledBigInt(data.price, 6);     // price of 1 BTC

        // calculate PnL, margin
        // update account with PnL and margin
        // create ledger entry

        await prisma.$transaction(async () => {

            const trade = await prisma.trade.findFirst({
                where: {
                    id: Number(id),
                    user_id: userId,
                    side: "SHORT"
                }
            });

            if(!trade || trade.status !== 'OPEN') {
                throw new Error('Requested trade does not exist or already closed');
            }
            
            const entry_price = trade.entry_price;
            const pnl = (entry_price - current_price) * trade.quantity / SATS_PER_BTC;

            const account = await prisma.account.update({
                where: {
                    user_id: userId
                },
                data: {
                    balance: { increment: pnl },
                    used_margin: { decrement: trade.margin_used },
                    free_margin: { increment: trade.margin_used + pnl }
                }
            });

            const updatedTrade = await prisma.trade.update({
                where: {
                    id: trade.id
                },
                data: {
                    status: 'CLOSED',
                    exit_price: current_price,
                    exit_time: new Date(),
                    realized_pnl: pnl
                }
            });


            await prisma.ledger_entry.create({
                data: {
                    account_id: account.id,
                    trade_id: trade.id,
                    type: "TRADE_PNL",
                    amount: pnl,
                    balance_after: account.balance,
                }  
            });
        });

        console.log("sell order executed successfully");
        
        return res.status(200).json({ message: "sell order executed successfully"});

    } catch (error: any) {
        console.log("error:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});



router.get('/open-trades', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }
        
        const openTrades = await prisma.trade.findMany({
            where: {
                user_id: userId,
                status: "OPEN"
            },
            include: {
                instrument: {
                    select: {
                        base_asset: true,
                        symbol: true
                    }
                }
            }
        });

        const trades = openTrades.map((t) => ({
            ...t,
            quantity: t.quantity.toString(),
            leverage: t.leverage.toString(),
            entry_price: t.entry_price.toString(),
            notional: t.notional.toString(),
            margin_used: t.margin_used.toString(),
            fees: t.fees.toString(),
            exit_price: t.exit_price?.toString() ?? null,
            realized_pnl: t.realized_pnl.toString(),
        }));

        return res.status(200).json({ trades: trades });

    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.get('/closed-trades', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if(userId === undefined) {
            return res.status(401).json({ message: "Issue with authentication" });
        }
        
        const closedTrades = await prisma.trade.findMany({
            where: {
                user_id: userId,
                status: "CLOSED"
            },
            include: {
                instrument: {
                    select: {
                        base_asset: true,
                        symbol: true
                    }
                }
            }
        });

        const trades = closedTrades.map((t) => ({
            ...t,
            quantity: t.quantity.toString(),
            leverage: t.leverage.toString(),
            entry_price: t.entry_price.toString(),
            notional: t.notional.toString(),
            margin_used: t.margin_used.toString(),
            fees: t.fees.toString(),
            exit_price: t.exit_price?.toString() ?? null,
            realized_pnl: t.realized_pnl.toString(),
        }));

        return res.status(200).json({ trades: trades });

    } catch(error: any) {
        console.log("error:", error);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});


export default router;