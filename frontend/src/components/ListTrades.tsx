import { useEffect, useState } from "react";
import { formatDateTime, prettifyString, formatPrice, formatQuantity } from "../utils/formatUtils";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";


const listTrades = ({ fetchTrades, openTrades, closedTrades}) => {

    const [showOpenTrades, setShowOpenTrades] = useState<boolean>(true);


    useEffect(() => {
        fetchTrades();
    }, [showOpenTrades]);


    const closeTrade = (tradeId : number, tradeSide: string) => {

        if(tradeSide.toUpperCase() === 'LONG') {

            api.post(`trade/close/long/${tradeId}`)
            .then((_response) => {
                fetchTrades();
                enqueueSnackbar('Trade closed successfully', {variant: "success"});
            })
            .catch((error: any) => {
                console.log(error.message);
                enqueueSnackbar('Error while closing trade', {variant: "error"});
            });
        } else {

            api.post(`trade/close/short/${tradeId}`)
            .then((_response) => {
                fetchTrades();
                enqueueSnackbar('Trade closed successfully', {variant: "success"});
            })
            .catch((error: any) => {
                console.log(error.message);
                enqueueSnackbar('Error while closing trade', {variant: "error"});
            });
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="inline-flex gap-2 w-fit rounded-md border border-gray-200 bg-gray-50 p-1 text-sm">
                <button
                    className={`cursor-pointer rounded-sm px-4 py-1.5 font-medium transition-colors duration-200 ${showOpenTrades ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
                    type="button"
                    onClick={() => setShowOpenTrades(true)}
                >
                    Open
                </button>
                <button
                    className={`cursor-pointer rounded-sm px-4 py-1.5 font-medium transition-colors duration-200 ${!showOpenTrades ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}
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
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                        <table className="w-full min-w-[760px] table-auto">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr className="border-b border-gray-200">
                                    <th className="px-3 py-2 text-left font-semibold">Asset</th>
                                    <th className="px-3 py-2 text-left font-semibold">Trade Type</th>
                                    <th className="px-3 py-2 text-right font-semibold">Entry Price</th>
                                    <th className="px-3 py-2 text-left font-semibold">Entry Time</th>
                                    <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                                    <th className="px-3 py-2 text-center font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {openTrades.map((trade: any) => (
                                    <tr 
                                        key={trade.id}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <td className="px-3 py-2 text-left">{trade.instrument.base_asset}</td>
                                        <td className="px-3 py-2 text-left">{prettifyString(trade.side)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatPrice(trade.entry_price)}</td>
                                        <td className="px-3 py-2 text-left whitespace-nowrap text-gray-600">{formatDateTime(trade.entry_time)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatQuantity(trade.quantity)}</td>
                                        <td className="px-3 py-2 text-center">
                                            <button 
                                                type="button" 
                                                className="cursor-pointer rounded-sm border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100 active:scale-95" 
                                                onClick={() => {closeTrade(trade.id, trade.side)}}
                                            >
                                                close
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2 w-full text-sm">
                    {closedTrades.length === 0 ? (
                        <div className="text-gray-700">No closed trades till now</div>
                    ):(
                        <div className="overflow-x-auto rounded-md border border-gray-200">
                        <table className="w-full min-w-[980px] table-auto">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr className="border-b border-gray-200">
                                    <th className="px-3 py-2 text-left font-semibold">Asset</th>
                                    <th className="px-3 py-2 text-left font-semibold">Trade Type</th>
                                    <th className="px-3 py-2 text-right font-semibold">Entry Price</th>
                                    <th className="px-3 py-2 text-left font-semibold">Entry Time</th>
                                    <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                                    <th className="px-3 py-2 text-right font-semibold">PnL</th>
                                    <th className="px-3 py-2 text-right font-semibold">Exit Price</th>
                                    <th className="px-3 py-2 text-left font-semibold">Exit Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {closedTrades.map((trade: any) => (
                                    <tr 
                                        key={trade.id}
                                        className="border-b border-gray-100 last:border-b-0"
                                    >
                                        <td className="px-3 py-2 text-left">{trade.instrument.base_asset}</td>
                                        <td className="px-3 py-2 text-left">{prettifyString(trade.side)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatPrice(trade.entry_price)}</td>
                                        <td className="px-3 py-2 text-left whitespace-nowrap text-gray-600">{formatDateTime(trade.entry_time)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatQuantity(trade.quantity)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatPrice(trade.realized_pnl)}</td>
                                        <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatPrice(trade.exit_price)}</td>
                                        <td className="px-3 py-2 text-left whitespace-nowrap text-gray-600">{formatDateTime(trade.exit_time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default listTrades;