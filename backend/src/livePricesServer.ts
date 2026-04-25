import express, { Request, Response } from "express";
import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
const port = 3000;

// recieve data from binance using websocket
const binanceServerUrl = 'wss://fstream.binance.com/market/ws/btcusdt@kline_1m';
const wsRec = new WebSocket(binanceServerUrl);

// create server to stream same data to frontend
const server = http.createServer(app);
const wss = new WebSocketServer({ server });


wsRec.on("open", () => {
    console.log("Connected to Binance 1");
});

wsRec.on("message", (event) => {

    const text = event.toString();
    const msg = JSON.parse(text);
    const payload = JSON.stringify(msg);

    console.log(payload);

    for(const client of wss.clients) {
        if(client.readyState === WebSocket.OPEN) {
            client.send(payload); // send to frontend client
        }
    }
});


app.get('/health', (req, res) => {
    return res.json({message: "health response"});
});


server.listen(port, () => {
    console.log(`websocket server is listening to port ${port}`);
});