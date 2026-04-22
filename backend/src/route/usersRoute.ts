import express, { Request, Response } from "express";

const router = express.Router();


router.post('/signin', async (req: Request, res: Response) => {
    try {
        
    } catch(error: any) {
        console.log(error.message);
        return res.status(500).json({message: "Internal server error. Please try again later"});
    }
});


export default router;