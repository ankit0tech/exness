import { useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { instruments } from "../utils/types.js";

const CreateTradeForm = ({ fetchTrades, displayInstrument, storeDisplayInstrument }) => {
    
    const SATS_PER_BTC = 100000000;

    const [tradeLong, setTradeLong] = useState<boolean>(true);
    const [quantity, setQuantity] = useState<number>(0.2);
    const [leverage, setLeverage] = useState<number>(1);


    const handleSubmit= (e: React.SubmitEvent) => {
        e.preventDefault();
        clickBuy();
    }

    const clickBuy = () => {
        
        const data = {
            instrument: displayInstrument,
            quantity: quantity * SATS_PER_BTC,
            leverage: leverage,
            // side: tradeLong ? 'LONG' : 'SHORT'
        };


        if (tradeLong) {
            api.post('/trade/create/long', data)
            .then((_response) => {
                enqueueSnackbar("Trade created successfully", {variant: "success"});
                fetchTrades();
            })
            .catch((error: any) => {
                console.log("message: ", error.response);
                enqueueSnackbar('Failed to open buy trade', {variant: "error"});
            });

        } else {
            api.post('/trade/create/short', data)
            .then((_response) => {
                enqueueSnackbar("Trade created successfully", {variant: "success"});
                fetchTrades();
            })
            .catch((error: any) => {
                console.log("message: ", error.response);
                enqueueSnackbar('Failed to open sell trade', {variant: "error"});
            });
        }
    }


    return (
        <div className="flex flex-col gap-2 min-w-[200px] rounded-lg border border-gray-300 shadow-xs p-4">
            <div className="flex flex-row gap-1 w-full items-stretch">
                <button
                    className={`rounded-sm hover:cursor-pointer w-full text-sm px-6 py-2 border rounded-md ${tradeLong ? 'border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] text-white' : 'border-[hsla(209,95%,53%,0.7)] text-[hsla(209,95%,53%,1)] bg-white'}`}
                    onClick={() => setTradeLong(true)}
                >
                    Buy
                </button>
                <button
                    className={`hover:cursor-pointer w-full text-sm px-6 py-2 border border-black border-red-600 rounded-md ${tradeLong ? 'border-[hsla(3,81%,58%,0.7)] text-[hsla(3,81%,58%,1)] bg-white' : 'border-[hsla(3,81%,58%,1)] bg-[hsla(3,81%,58%,1)] text-white'}`}
                    onClick={() => setTradeLong(false)}
                >
                    Sell
                </button>
            </div>

            <form 
                className="text-sm flex flex-col gap-2 border border-gray-300 rounded-lg p-4 max-w-[320px]"
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
                        className="border border-gray-300 hover:border-gray-400 active:border-gray-400 rounded-sm outline-hidden py-2 px-4 transition-colors duration-200"
                        value={displayInstrument}
                        defaultValue={"BTCUSD"}
                        onChange={(e) => storeDisplayInstrument(e.target.value)}
                    >
                        {instruments.map((input) => <option value={input}>{input.replace('USD', '')}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label 
                        htmlFor="quantity"
                    >
                        Volume(lot)
                    </label>

                    <div className="flex items-stretch border border-gray-300 hover:border-gray-400 active:border-gray-400 rounded-sm overflow-hidden">
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
                            className="text-gray-600 border-x border-gray-300 px-4 _bg-gray-50 hover:bg-gray-100"
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
                    <div className="flex items-stretch border border-gray-300 hover:border-gray-400 active:border-gray-400 rounded-sm overflow-hidden">
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
                            className="text-gray-600 border-x border-gray-300 hover:border-gray-400 active:border-gray-400 px-4 _bg-gray-50 hover:bg-gray-100"
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
                    className={`cursor-pointer text-sm border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 ${tradeLong ? 'border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] text-white' : 'border-[hsla(3,81%,58%,1)] bg-[hsla(3,81%,58%,1)] text-white'}`}
                >
                    { tradeLong ? 'Confirm Buy' : 'Confirm Sell' }
                </button>
            </form>
        </div>
    );}

export default CreateTradeForm;