import express from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { config } from '../config.js';
import { PrismaClient } from '../generated/prisma/client.js';
// import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();


interface UserInfo {
    email: string;
    sub: string;
    [key: string]: any;
}

router.post('/login/federated/google', async (req, res) => {

    try {
        const token = req.body.token;
        
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const payload = await response.json() as UserInfo;
        
        if(!response.ok || !payload?.email) {
            return res.status(401).json({ success: false});
        }

        let user = await prisma.userinfo.findUnique({
            where: {
                email: payload.email,
            }
        });

        if (!user) {
            user = await prisma.userinfo.create({
                data: {
                    email: payload.email,
                    google_id: payload.sub,
                    provider: 'google'
                }
            });
        } else if (user.provider != 'google' && !user.google_id) {
            user = await prisma.userinfo.update({
                where: {
                    email: payload.email,
                },
                data: {
                    google_id: payload.sub,
                }
            });
        }

        const jwtToken = jwt.sign({
                email: user.email,
                userId: user.id,
                type: 'login'
            },
            config.auth.jwtSecret,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            success: true,
            token: `Bearer ${jwtToken}`
        })
    } catch (error) {
        console.log('Token verification failed: ', error);
        res.status(401).json({success: false, message: 'Invalid Token'});
    }
});

// router.get('/logout', function(req, res, next) {
//     try {
//         res.status(200).json({
//             success: true,
//             message: 'Logged out successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Logout failed'
//         });
//     }
// });


export default router;
