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
            <div className="flex flex-row gap-4 text-sm">
                <button
                    className={`px-4 py-2 text-white hover:cursor-pointer _rounded-sm border border-gray-700 ${showOpenTrades === true ? 'border-b-2 bg-yellow-500' : 'bg-yellow-500'}`}
                    type="button"
                    onClick={() => setShowOpenTrades(true)}
                >
                    Open
                </button>
                <button
                    className={`px-4 py-2 text-white hover:cursor-pointer _rounded-sm border border-gray-700 ${showOpenTrades === false ? 'border-b-2 bg-yellow-500' : 'bg-yellow-500'}`}
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
                                        <td className="px-2 py-2 text-left">{formatPrice(trade.entry_price)}</td>
                                        <td className="px-2 py-2 text-left">{formatDateTime(trade.entry_time)}</td>
                                        <td className="px-2 py-2 text-left">{formatQuantity(trade.quantity)}</td>
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
                    {closedTrades.length === 0 ? (
                        <div className="text-gray-700">No closed trades till now</div>
                    ):(
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
                                        <td className="px-2 py-2 text-left">{formatPrice(trade.entry_price)}</td>
                                        <td className="px-2 py-2 text-left">{formatDateTime(trade.entry_time)}</td>
                                        <td className="px-2 py-2 text-left">{formatQuantity(trade.quantity)}</td>
                                        <td className="px-2 py-2 text-left">{formatPrice(trade.exit_price)}</td>
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

export default listTrades;