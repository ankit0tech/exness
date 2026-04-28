import axios from "axios";
import { AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, createChart } from "lightweight-charts";
import type { UTCTimestamp } from 'lightweight-charts';

// import { eventNames } from "process";
import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import type { Trade } from "../utils/types";
import { formatDateTime, prettifyString } from "../utils/formatUtils";

const HomePage = () => {

    const SATS_PER_BTC = 1000000;
    const [instrument, setInstrument] = useState<string|null>('BTCUSD');
    const [quantity, setQuantity] = useState<number>(0.2);
    const [leverage, setLeverage] = useState<number>(1);
    const [openTrades, setOpenTrades] = useState<Trade[]>([]);
    const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
    const [showOpenTrades, setShowOpenTrades] = useState<boolean>(true);
    const [tradeBuy, setTradeBuy] = useState<boolean>(true);

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
        
        const chart = createChart(
            chartRef.current, 
            {
                layout: {
                    textColor: "black",
                    background: { color: "white" },
                },
                timeScale: {
                    timeVisible: true,       // show intraday time
                    secondsVisible: false,   // set true for second-level
                    barSpacing: 8,           // more room for time ticks
                    tickMarkFormatter: (time: any) => {
                        const d = new Date((typeof time === "number" ? time : time.timestamp) * 1000);
                        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                    },
                },
                localization: {
                    timeFormatter: (time: any) => {
                        const d = new Date((typeof time === "number" ? time : time.timestamp) * 1000);
                        return d.toLocaleString();
                    },
                },
            }
        );

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

    const fetchTrades = () => {
        fetchOpenTrades();
        fetchClosedTrades();
    }
    
    const fetchOpenTrades = () => {
        api.get('/trade/open-trades')
        .then((response) => {
            console.log(response);
            setOpenTrades(response.data.trades);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Failed to load open trades", {variant: "error"});
        });

    }
    const fetchClosedTrades = () => {
        api.get('/trade/closed-trades')
        .then((response) => {
            console.log(response);
            setClosedTrades(response.data.trades);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Failed to load closed trades", {variant: "error"});
        });
    }
    useEffect(() => {
        fetchTrades();
    }, [showOpenTrades]);

    const handleSubmit= (e: React.SubmitEvent) => {
        e.preventDefault();
        clickBuy();
    }

    const clickBuy = () => {
        
        const data = {
            instrument: instrument,
            quantity: quantity * SATS_PER_BTC,
            leverage: leverage,
            // side: tradeBuy ? 'LONG' : 'SHORT'
        };

        console.log(data);

        if (tradeBuy) {
            api.post('/trade/create/buy', data)
            .then((response) => {
                fetchTrades();
                console.log("response:", response)
            })
            .catch((error: any) => {
                console.log("error: ", error);
                console.log("message: ", error.response);
                enqueueSnackbar('Failed to open buy trade', {variant: "error"});
            });

        } else {
            api.post('/trade/create/sell', data)
            .then((response) => {
                fetchTrades();
                console.log("response:", response)
            })
            .catch((error: any) => {
                console.log("error: ", error);
                console.log("message: ", error.response);
                enqueueSnackbar('Failed to open sell trade', {variant: "error"});
            });
        }

    }

    const closeTrade = (tradeId : number, tradeSide: string) => {
        console.log("Closing trade: ", tradeId);

        if(tradeSide.toUpperCase() === 'LONG') {
            api.post(`trade/close/sell/${tradeId}`)
            .then((response) => {
                fetchTrades();
                console.log(response);
                enqueueSnackbar('Trade closed successfully', {variant: "success"});
            })
            .catch((error: any) => {
                console.log(error.message);
                enqueueSnackbar('Error while closing trade', {variant: "error"});
            });
        } else {
            api.post(`trade/close/sell/${tradeId}`)
            .then((response) => {
                fetchTrades();
                console.log(response);
                enqueueSnackbar('Trade closed successfully', {variant: "success"});
            })
            .catch((error: any) => {
                console.log(error.message);
                enqueueSnackbar('Error while closing trade', {variant: "error"});
            });
        }
    }


    
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="text-sm text-gray-800">
                {usermail}
            </div>

            <div className="flex flex-row gap-2">
                <div className="w-full ring ring-gray-700 rounded-sm p-4">
                    <div 
                        className="w-full h-[600px]"
                        ref={chartRef} 
                    >
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="flex flex-row gap-1 w-full items-stretch">
                        <button
                            className={`w-full text-sm px-6 py-2 border border-black border-blue-600 _rounded-md ${tradeBuy ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'}`}
                            onClick={() => setTradeBuy(true)}
                        >
                            Buy
                        </button>
                        <button
                            className={`w-full text-sm px-6 py-2 border border-black border-red-600 _rounded-md ${tradeBuy ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}
                            onClick={() => setTradeBuy(false)}
                        >
                            Sell
                        </button>
                    </div>

                    <form 
                        className="text-sm flex flex-col gap-2 border rounded-lg p-4 max-w-[320px]"
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
                                className="border border-gray-500 hover:border-gray-700 active:border-gray-700 rounded-sm outline-hidden py-2 px-4 transition-colors duration-200"
                                value={instrument}
                                defaultValue={"BTCUSD"}
                                onChange={(e) => setInstrument(e.target.value)}
                            >
                                <option value="BTCUSD">BTCUSD</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label 
                                htmlFor="quantity"
                            >
                                Volume(lot)
                            </label>

                            <div className="flex items-stretch border border-gray-500 hover:border-gray-700 active:border-gray-700 rounded-sm overflow-hidden">
                                <input
                                    id="quantity"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    className="w-full px-3 py-2 outline-hidden text-left [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />

                                <button
                                    type="button"
                                    className="text-gray-600 border-x border-gray-500 px-4 _bg-gray-50 hover:bg-gray-100"
                                    onClick={() => setQuantity((q) => Math.max(0, Number((q - 0.01).toFixed(2))))}
                                >
                                    -
                                </button>

                                <button
                                    type="button"
                                    className="text-gray-600 px-4 _bg-gray-50 hover:bg-gray-100"
                                    onClick={() => setQuantity((q) => Number((q + 0.01).toFixed(2)))}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="leverage"
                            >
                                Leverage
                            </label>
                            <div className="flex items-stretch border border-gray-500 hover:border-gray-700 active:border-gray-700 rounded-sm overflow-hidden">
                                <input
                                    id="leverage"
                                    type="number"
                                    min={0}
                                    max={20}
                                    className="text-left w-full px-3 py-2 outline-hidden text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={leverage}
                                    onChange={(e) => setLeverage(Number(e.target.value))}
                                ></input>
                            
                                <button
                                    type="button"
                                    className="text-gray-600 border-x border-gray-500 hover:border-gray-700 active:border-gray-700 px-4 _bg-gray-50 hover:bg-gray-100"
                                    onClick={() => setLeverage((q) => Math.max(0, q - 1))}
                                >
                                    -
                                </button>

                                <button
                                    type="button"
                                    className="text-gray-600 px-4 _bg-gray-50 hover:bg-gray-100"
                                    onClick={() => setLeverage((q) => Math.min(20, q + 1))}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            className={`text-sm border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 ${tradeBuy ? 'bg-blue-600 text-white border-blue-800' : 'bg-red-600 text-white border-red-800'}`}
                        >
                            { tradeBuy ? 'Confirm Buy' : 'Confirm Sell' }
                        </button>
                    </form>
                </div>
            </div>

            

            <div className="flex flex-row gap-4 text-sm">
                <button
                    className={`px-4 py-2 text-white hover:cursor-pointer ${showOpenTrades === true ? 'border-b-2 border-gray-700 bg-yellow-500' : 'bg-yellow-500'}`}
                    type="button"
                    onClick={() => setShowOpenTrades(true)}
                >
                    Open
                </button>
                <button
                    className={`px-4 py-2 text-white hover:cursor-pointer ${showOpenTrades === false ? 'border-b-2 border-gray-700 bg-yellow-500' : 'bg-yellow-500'}`}
                    type="button"
                    onClick={() => setShowOpenTrades(false)}
                >
                    Closed
                </button>
            </div>

            {showOpenTrades === true ? (
                <div className="flex flex-col gap-2 w-full text-sm">
                    {
                    openTrades.length === 0 ? (
                        <div className="text-gray-700">No Open trades till now</div>
                        ):(
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
                                        <td className="px-2 py-2 text-left">
                                            <button 
                                                type="button" 
                                                className="px-2 py-2 text-left hover:cursor-pointer active:scale-95 border rounded-sm hover:bg-stone-100 transition-transform transition-colors duration-300" 
                                                onClick={() => {closeTrade(trade.id, trade.side)}}
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
            ) : (
                <div className="flex flex-col gap-2 w-full text-sm">
                {
                    closedTrades.length === 0 ? (
                    <div className="text-gray-700">No closed trades till now</div>
                    ) : (
                    <table className="table-fixed w-full border rounded-sm">
                        <thead className="w-full p-2 font-medium">
                            <tr className="w-full p-2">
                                <th className="px-2 py-2 text-left">Asset</th>
                                <th className="px-2 py-2 text-left">Trade Type</th>
                                <th className="px-2 py-2 text-left">Entry Price</th>
                                <th className="px-2 py-2 text-left">Entry Time</th>
                                <th className="px-2 py-2 text-left">Quantity</th>
                                <th className="px-2 py-2 text-left">Exit Price</th>
                                <th className="px-2 py-2 text-left">Exit Time</th>
                            </tr>
                        </thead>
                        <tbody className="w-full border p-2">
                            {closedTrades.map((trade: any) => (
                                <tr 
                                    key={trade.id}
                                    className="w-full p-2"
                                >
                                    <td className="px-2 py-2 text-left">{trade.instrument.base_asset}</td>
                                    <td className="px-2 py-2 text-left">{prettifyString(trade.side)}</td>
                                    <td className="px-2 py-2 text-left">{trade.entry_price}</td>
                                    <td className="px-2 py-2 text-left">{formatDateTime(trade.entry_time)}</td>
                                    <td className="px-2 py-2 text-left">{trade.quantity}</td>
                                    <td className="px-2 py-2 text-left">{trade.exit_price}</td>
                                    <td className="px-2 py-2 text-left">{formatDateTime(trade.exit_time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            )}

        </div>
    );
}

export default HomePage;