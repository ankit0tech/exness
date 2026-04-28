import { useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";

const CreateTradeForm = ({ fetchTrades }) => {
    
    const SATS_PER_BTC = 1000000;

    const [tradeLong, setTradeLong] = useState<boolean>(true);
    const [instrument, setInstrument] = useState<string|null>('BTCUSD');
    const [quantity, setQuantity] = useState<number>(0.2);
    const [leverage, setLeverage] = useState<number>(1);


    const handleSubmit= (e: React.SubmitEvent) => {
        e.preventDefault();
        clickBuy();
    }

    const clickBuy = () => {
        
        const data = {
            instrument: instrument,
            quantity: quantity * SATS_PER_BTC,
            leverage: leverage,
            // side: tradeLong ? 'LONG' : 'SHORT'
        };

        console.log(data);

        if (tradeLong) {
            api.post('/trade/create/long', data)
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
            api.post('/trade/create/short', data)
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


    return (
        <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex flex-row gap-1 w-full items-stretch">
                <button
                    className={`w-full text-sm px-6 py-2 border border-black border-blue-600 _rounded-md ${tradeLong ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'}`}
                    onClick={() => setTradeLong(true)}
                >
                    Buy
                </button>
                <button
                    className={`w-full text-sm px-6 py-2 border border-black border-red-600 _rounded-md ${tradeLong ? 'bg-white text-red-500' : 'bg-red-500 text-white'}`}
                    onClick={() => setTradeLong(false)}
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
                    className={`text-sm border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 ${tradeLong ? 'bg-blue-600 text-white border-blue-800' : 'bg-red-600 text-white border-red-800'}`}
                >
                    { tradeLong ? 'Confirm Buy' : 'Confirm Sell' }
                </button>
            </form>
        </div>
    );}

export default CreateTradeForm;