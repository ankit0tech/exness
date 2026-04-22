import express from 'express';
import cors from 'cors';
import usersRoute from './route/usersRoute.js';

const app = express();


app.use(express.json());

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,

    })
);

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://www.gstatic.com https://accounts.google.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "connect-src 'self' https://www.googleapis.com; " +
        "report-uri /csp-violation-report-endpoint" +
        "default-src 'self';"
    );
    next();
});

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' gstatic.com google.com 'unsafe-inline' 'unsafe-eval'; " +
        "frame-src 'self' https://*.google.com; " +
        "connect-src 'self' https://*.googleapis.com https://*.gstatic.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "default-src 'self';"
    );
    next();
});

// app.use((req, res, next) => { 
//     res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
//     next();
// });


// app.get('/', (request, response) => {
//     return response.status(200).json({"data": "Welcome"});
// });


app.use('/users', usersRoute);

const port = 5555;
app.listen(port, () => {
    console.log(`App is listening to port ${port}`);
})