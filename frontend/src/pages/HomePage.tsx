import axios from "axios";
import { AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, createChart } from "lightweight-charts";
import type { UTCTimestamp } from 'lightweight-charts';

// import { eventNames } from "process";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import type { OpenTrade } from "../utils/types";
import { formatDateTime, prettifyString } from "../utils/formatUtils";

const HomePage = () => {

    const [instrument, setInstrument] = useState<string|null>(null);
    const [quantity, setQuantity] = useState<number>(0);
    const [leverage, setLeverage] = useState<number>(0);
    const [openTrades, setOpenTrades] = useState<OpenTrade[]>([]);

    // const [socket, setSocket] = useState<WebSocket|null>(null);
    const chartRef = useRef<HTMLDivElement|null>(null);
    // const binanceWebSocketUrl = "wss://fstream.binance.com/market/ws/btcusdt@markPrice";
    const backendWebSocketurl = "ws://localhost:3000";
    const historicAPI = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=30"

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



    const fetchOpenTrades = () => {
        api.get('/trade/open-trades')
        .then((response) => {
            console.log(response);
            setOpenTrades(response.data.trades);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Failed to load user trades", {variant: "error"});
        });

    }
    useEffect(() => {
        fetchOpenTrades();
    }, []);

    const handleSubmit= (e: React.SubmitEvent) => {
        e.preventDefault();
        clickBuy();
    }

    const clickBuy = () => {
        
        const data = {
            instrument: instrument,
            quantity: quantity,
            leverage: leverage
        };

        console.log(data);

        api.post('/trade/create/buy', data)
        .then((response) => {
            fetchOpenTrades();
            console.log("response:", response)
        })
        .catch((error: any) => {
            // console.log("error: ", error);
            console.log("message: ", error.response);
        });
    }

    const closeTrade = (tradeId : any) => {
        console.log("Closing trade: ", tradeId);
        
        api.post(`trade/close/sell/${tradeId}`)
        .then((response) => {
            fetchOpenTrades();
            console.log(response);
            enqueueSnackbar('Trade closed successfully', {variant: "success"});
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while closing trade', {variant: "error"});
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

            <form 
                className="flex flex-col gap-2 border rounded-lg p-4 max-w-[320px]"
                onSubmit={(e) => handleSubmit(e)} 
            >
                <div className="flex flex-col gap-1">
                    <label 
                        htmlFor="instrument"
                    >
                        Instrument
                    </label>
                    <select 
                        id="instrument"
                        className="border rounded-sm outline-hidden py-2 px-4 hover:bg-sky-100 transition-colors duration-200"
                        value={instrument}
                        onChange={(e) => setInstrument(e.target.value)}
                    >
                        <option value="">(empty)</option>
                        <option value="BTCUSD">BTCUSD</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label 
                        htmlFor="quantity"
                    >
                        Quantity
                    </label>
                    <input 
                        id="quantity"
                        type="number"
                        min={0}
                        className="border rounded-sm outline-hidden py-2 px-4 hover:bg-sky-100 transition-colors duration-200"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    ></input>
                </div>

                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="leverage"
                    >
                        Leverage
                    </label>
                    <input
                        id="leverage"
                        type="number"
                        min={0}
                        max={20}
                        className="border rounded-sm outline-hidden py-2 px-4 hover:bg-sky-100 transition-colors duration-200"
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                    ></input>
                </div>

                <button
                    type='submit'
                    className="border rounded-sm outline-hidden text-white py-2 px-4 bg-sky-500 hover:bg-sky-600 transition-colors duration-200 border border-gray-800"
                >
                    buy
                </button>
            </form>

            <div className="flex flex-col gap-2 w-full">
                {
                    openTrades.length === 0 ? (
                    <div className="text-sm text-gray-700">No Open trades till now</div>
                    ) : (
                    <table className="table-fixed w-full border rounded-sm">
                        <thead className="w-full p-2 font-medium">
                            <tr className="w-full p-2">
                                <th className="px-2 py-2 text-left">Asset</th>
                                <th className="px-2 py-2 text-left">Trade Type</th>
                                <th className="px-2 py-2 text-left">Entry Price</th>
                                <th className="px-2 py-2 text-left">Entry Time</th>
                                <th className="px-2 py-2 text-left">Quantity</th>
                                <th className="px-2 py-2 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="w-full border p-2">
                            {openTrades.map((trade: any) => (
                                <tr 
                                    key={trade.id}
                                    className="w-full p-2"
                                >
                                    <td className="px-2 py-2 text-left">{trade.instrument.base_asset}</td>
                                    <td className="px-2 py-2 text-left">{prettifyString(trade.side)}</td>
                                    <td className="px-2 py-2 text-left">{trade.entry_price}</td>
                                    <td className="px-2 py-2 text-left">{formatDateTime(trade.entry_time)}</td>
                                    <td className="px-2 py-2 text-left">{trade.quantity}</td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className="px-2 py-2 text-left hover:cursor-pointer" 
                                            onClick={() => {closeTrade(trade.id)}}
                                        >
                                            close
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default HomePage;