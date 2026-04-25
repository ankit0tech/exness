import axios from "axios";
import { AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, createChart } from "lightweight-charts";
import type { UTCTimestamp } from 'lightweight-charts';

// import { eventNames } from "process";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import api from "../utils/api";

const HomePage = () => {

    // const [socket, setSocket] = useState<WebSocket|null>(null);
    const chartRef = useRef<HTMLDivElement|null>(null);
    // const binanceWebSocketUrl = "wss://fstream.binance.com/market/ws/btcusdt@markPrice";
    const backendWebSocketurl = "ws://localhost:3000";
    const historicAPI = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30"

    const usermail = localStorage.getItem("email") || "";


    useEffect(() => {
        if(!chartRef.current) return;

        const ws = new WebSocket(backendWebSocketurl);
        // "77511.90"

        ws.onopen = () => { console.log('websocket connected'); }
        // setSocket(ws);

        // const chartOptions = { layout: { textColor: 'black', background: { type: 'solid', color: 'white' }}};
        const chart = createChart(chartRef.current);

        // const areaSeries = chart.addSeries(AreaSeries);
        // const barSeries = chart.addSeries(BarSeries);
        // const baselineSeries = chart.addSeries(BaselineSeries);
        
        // const chart = createChart(document.getElementById('container'), chartOptions);
        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#2962FF', topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        });

        axios.get(historicAPI)
        .then((response) => {

            const historicAreaSeries = response.data.map((obj: any) => {
                return { 
                    time: Math.floor(obj[0] / 1000) as UTCTimestamp,
                    value: Number(obj[4])
                };
            });

            const historicCandleStickSeries = response.data.map((obj: any) => {
                return { 
                    time: Math.floor(obj[0] / 1000) as UTCTimestamp,
                    open: Number(obj[1]),
                    high: Number(obj[2]),
                    low: Number(obj[3]),
                    close: Number(obj[4])
                };
            });

            areaSeries.setData(historicAreaSeries);
            candlestickSeries.setData(historicCandleStickSeries);

            ws.onmessage = (event) => {
                // console.log(JSON.parse(event.data));
                const obj = JSON.parse(event.data);

                areaSeries.update({
                    time: Math.floor(obj.k.t / 1000) as UTCTimestamp,
                    value: Number(obj.k.c)
                });

                candlestickSeries.update({
                    time: Math.floor(obj.k.t / 1000) as UTCTimestamp,
                    open: Number(obj.k.o),
                    high: Number(obj.k.h),
                    low: Number(obj.k.l),
                    close: Number(obj.k.c)
                });
            }

            chart.timeScale().fitContent();

        })
        .catch((e: any) => {
            console.log(e);
        });


        return () => {
            ws.close();
            chart.remove();
        }

    }, []);

    const clickBuy = () => {
        api.post('')
        .then((response) => {
            console.log(response)
        })
        .catch((error: any) => {
            console.log(error);
        });

    }
    
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="text-sm text-gray-800">
                {usermail}
            </div>

            <div className="ring ring-gray-700 rounded-sm p-4">
                <div 
                    className="w-full h-[600px]"
                    ref={chartRef} 
                >
                </div>
            </div>

            <form>
                <Button onClick={clickBuy}>buy</Button>
            </form>
        </div>
    );
}

export default HomePage;