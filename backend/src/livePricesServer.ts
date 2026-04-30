import express, { Request, Response } from "express";
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const port = 3000;

// recieve data from binance using websocket
const btcStreamUrl = 'wss://fstream.binance.com/market/ws/btcusdt@kline_1m';

// const wsRec = new WebSocket(btcStreamUrl);

// create server to stream same data to frontend
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


// wsRec.on("open", () => {
//     console.log("Connected to Binance 1");
// });

// wsRec.on("message", (event) => {

//     const text = event.toString();
//     const msg = JSON.parse(text);
//     const payload = JSON.stringify(msg);

//     console.log(payload);

//     for(const client of wss.clients) {
//         if(client.readyState === WebSocket.OPEN) {
//             client.send(payload); // send to frontend client
//         }
//     }
// });

const streams = [
    { symbol: "BTCUSD", url: "wss://fstream.binance.com/market/ws/btcusdt@kline_1m" },
    { symbol: "ETHUSD", url: "wss://fstream.binance.com/market/ws/ethusdt@kline_1m" },
    { symbol: "BNBUSD", url: "wss://fstream.binance.com/market/ws/bnbusdt@kline_1m" }, 
];

for (const s of streams) {
    const upstream = new WebSocket(s.url);

    upstream.on("open", () => {
        console.log(`Connected to ${s.symbol}`);
    });

    upstream.on("message", (event) => {
        const raw = JSON.parse(event.toString());
        const payload = JSON.stringify({
        symbol: s.symbol,
        data: raw,
        });
        // const payload = JSON.stringify(raw);

        console.log(payload);

        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    });

    upstream.on("error", (err) => {
        console.error(`Upstream error ${s.symbol}`, err);
    });

    upstream.on("close", () => {
        console.log(`Upstream closed ${s.symbol}`);
    });
}


app.get('/health', (req, res) => {
    return res.json({message: "health response"});
});


server.listen(port, () => {
    console.log(`websocket server is listening to port ${port}`);
});