import axios from "axios";
import { AreaSeries, CandlestickSeries, createChart } from "lightweight-charts";
import type { UTCTimestamp } from 'lightweight-charts';

import { useEffect, useRef, useState } from "react";
import api from "../utils/api.js";
import { enqueueSnackbar } from "notistack";
import type { Trade } from "../utils/types.js";
import CreateTradeForm from "../components/CreateTradeForm.js";
import ListTrades from "../components/ListTrades.js";
import type { Instrument } from "../utils/types.js";

type KlineMessage = {
    symbol: string;
    data: {
        k: {
            t: number;
            o: string;
            h: string;
            l: string;
            c: string;
        };
    };
};

const parseKlineMessage = (raw: string): KlineMessage | null => {
    try {
        const obj = JSON.parse(raw) as unknown;
        if (!obj || typeof obj !== "object") return null;
        const rec = obj as Record<string, unknown>;
        if (typeof rec.symbol !== "string" || !rec.data || typeof rec.data !== "object") return null;
        const data = rec.data as Record<string, unknown>;
        const k = data.k as Record<string, unknown> | undefined;
        if (!k || typeof k.t !== "number") return null;
        for (const key of ["o", "h", "l", "c"] as const) {
            if (typeof k[key] !== "string" && typeof k[key] !== "number") return null;
        }
        return obj as KlineMessage;
    } catch {
        return null;
    }
};

const HomePage = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [openTrades, setOpenTrades] = useState<Trade[]>([]);
    const [closedTrades, setClosedTrades] = useState<Trade[]>([]);
    const chartRef = useRef<HTMLDivElement|null>(null);
    const [instruments, setInstruments] = useState<Instrument[]>([]);

    const [displayInstrument, setDisplayInstrument] = useState<string>(() => {
        const storageInstrument = localStorage.getItem("displayInstrument");
        return storageInstrument ? storageInstrument : 'BTCUSD';
    });

    const storeDisplayInstrument = (input: string) => {
        setDisplayInstrument(input);
        localStorage.setItem("displayInstrument", input);
    }

    const backendWebSocketurl = "ws://localhost:3000";
    
    
    useEffect(() => {
        if (instruments.length === 0 || !chartRef.current) return;
        
        const symbol = displayInstrument;
        const historicAPI = `https://api.binance.com/api/v3/klines?symbol=${symbol}T&interval=1m&limit=120`;
        
        const ws = new WebSocket(backendWebSocketurl);
        const pendingKlines: KlineMessage[] = [];
        let historicLoaded = false;

        const chart = createChart(
            chartRef.current,
            {
                layout: {
                    textColor: "black",
                    background: { color: "white" },
                },
                width: chartRef.current.clientWidth,
                height: chartRef.current.clientHeight,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    barSpacing: 8,
                    tickMarkFormatter: (time: number | { timestamp: number }) => {
                        const t = typeof time === "number" ? time : time.timestamp;
                        const d = new Date(t * 1000);
                        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
                    },
                },
                localization: {
                    timeFormatter: (time: number | { timestamp: number }) => {
                        const t = typeof time === "number" ? time : time.timestamp;
                        const d = new Date(t * 1000);
                        return d.toLocaleString();
                    },
                },
            }
        );

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#2962FF', topColor: '#2962FF',
            bottomColor: 'rgba(41, 98, 255, 0.28)',
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a', downColor: '#ef5350', borderVisible: false,
            wickUpColor: '#26a69a', wickDownColor: '#ef5350',
        });

        const applyKline = (obj: KlineMessage) => {
            if (obj.symbol !== symbol) return;
            const k = obj.data.k;
            const time = Math.floor(k.t / 1000) as UTCTimestamp;
            areaSeries.update({ time, value: Number(k.c) });
            candlestickSeries.update({
                time,
                open: Number(k.o),
                high: Number(k.h),
                low: Number(k.l),
                close: Number(k.c),
            });
            chart.timeScale().scrollToRealTime();
        };

        axios
            .get(historicAPI)
            .then((response) => {

                const historicAreaSeries = response.data.map((obj: number[]) => ({
                    time: Math.floor(obj[0] / 1000) as UTCTimestamp,
                    value: Number(obj[4]),
                }));

                const historicCandleStickSeries = response.data.map((obj: number[]) => ({
                    time: Math.floor(obj[0] / 1000) as UTCTimestamp,
                    open: Number(obj[1]),
                    high: Number(obj[2]),
                    low: Number(obj[3]),
                    close: Number(obj[4]),
                }));

                areaSeries.setData(historicAreaSeries);
                candlestickSeries.setData(historicCandleStickSeries);

                historicLoaded = true;
                for (const p of pendingKlines) applyKline(p);
                pendingKlines.length = 0;

                chart.timeScale().fitContent();
            })
            .catch((e: unknown) => {
                if (axios.isCancel(e)) return;
                console.error(e);
                enqueueSnackbar("Failed to load chart history", { variant: "error" });
            });

        ws.onopen = () => {
            console.log("websocket connected");
        };

        ws.onmessage = (event) => {
            const msg = parseKlineMessage(String(event.data));
            if (!msg || msg.symbol !== symbol) return;
            if (!historicLoaded) {
                pendingKlines.push(msg);
                if (pendingKlines.length > 120) pendingKlines.shift();
                return;
            }
            applyKline(msg);
        };

        ws.onerror = () => {
            enqueueSnackbar("Live price connection error", { variant: "warning" });
        };

        ws.onclose = (ev) => {
            if (!ev.wasClean) {
                enqueueSnackbar("Live price connection closed", { variant: "info" });
            }
        };

        return () => {
            ws.close();
            chart.remove();
        };

    }, [displayInstrument, instruments.length]);

    const fetchTrades = () => {
        fetchOpenTrades();
        fetchClosedTrades();
    }

    const fetchOpenTrades = () => {
        api.get('/trade/open-trades')
        .then((response) => {
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
            setClosedTrades(response.data.trades);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Failed to load closed trades", {variant: "error"});
        });
    }

    useEffect(() => {

        setIsLoading(true);

        api.get('/instrument/active')
        .then((response) => {
            const list = response.data as Instrument[];
            setInstruments(list);
            if (list.length === 0) return;
            setDisplayInstrument((prev) => {
                if (list.some((i) => i.symbol === prev)) return prev;
                const next = list[0].symbol;
                localStorage.setItem("displayInstrument", next);
                return next;
            });
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while loading instruments', { variant: "error" });
        })
        .finally(() => {
            setIsLoading(false);
        });

    }, []);

    return (
        <div className="flex flex-col gap-4 p-4">
            {isLoading ? (
                <div className="font-semibold text-gray-700">
                    Loading...
                </div>
            ) : (
                instruments.length === 0 ? (
                    <div className="font-semibold text-gray-700">
                        No data to display...
                    </div>
                ) : (
                    <>
                        <div className="w-fit flex border border-gray-300 bg-gray-50 overflow-hidden">
                            {instruments.map((input) => <button
                                    key={input.id}
                                    type="button"
                                    onClick={() => storeDisplayInstrument(input.symbol)}
                                    className={`py-2 px-4 font-semibold cursor-pointer text-sm text-gray-600 transition-colors duration-200 border-gray-300 ${displayInstrument === input.symbol ? 'text-gray-700 bg-white shadow-sm border-b ' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'}`}
                                >
                                    { input.base_asset }
                                </button>
                            )}
                        </div>

                        <div className="flex flex-row gap-2">
                            <div className="w-full ring ring-gray-300 rounded-md shadow-sm p-4">
                                <div
                                    className="w-full h-[480px]"
                                    ref={chartRef}
                                >
                                </div>
                            </div>

                            <CreateTradeForm fetchTrades={fetchTrades} displayInstrument={displayInstrument} storeDisplayInstrument={storeDisplayInstrument} instruments={instruments}/>
                        </div>

                        <ListTrades fetchTrades={fetchTrades} openTrades={openTrades} closedTrades={closedTrades} />
                    </>
                )
            )}
        </div>
    );
}

export default HomePage;
