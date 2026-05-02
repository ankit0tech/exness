import { enqueueSnackbar } from "notistack";
import api from "../utils/api";
import { useEffect, useState } from "react";
import type { Instrument } from "../utils/types";
import { formatPrice } from "../utils/formatUtils";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { useNavigate } from "react-router-dom";


const Instruments = () => {

    const [instruments, setInstruments] = useState<Instrument[]>([]);
    const navigate = useNavigate();

    useEffect(() => {

        api.get('/instrument')
        .then((response) => {
            console.log(response);
            setInstruments(response.data);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Error while fetching instruments", {variant: "error"});
        });

    }, []);
    

    return (
        <div className="p-4 ">
            {instruments.length === 0 ? (
                <div className="font-medium text-gray-600">
                    No instruments to display
                </div>
            ) : (
                <div className="text-sm overflow-x-auto rounded-md border border-gray-200">
                    <table className="w-full min-w-[760px] table-auto table-fixed border-collapse">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr className="border-b border-gray-200">
                                <th className="px-3 py-2 text-left font-semibold">Symbol</th>
                                <th className="px-3 py-2 text-left font-semibold">Base Asset</th>
                                <th className="px-3 py-2 text-left font-semibold">Is Active</th>
                                <th className="px-3 py-2 text-left font-semibold">Quote Currency</th>
                                <th className="px-3 py-2 text-right font-semibold">Max Leverage</th>
                                <th className="px-3 py-2 text-right font-semibold">Min Quantity</th>
                                <th className="px-3 py-2 text-right font-semibold">Fees Per Unit</th>
                                <th className="px-3 py-2 text-left font-semibold">Options</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {instruments.map((instrument) => (
                                <tr 
                                    key={instrument.id}
                                    className="text-gray-800 border-b border-gray-100 last:border-b-0"
                                >
                                    <td className="px-3 py-2 text-left">{instrument.symbol}</td>
                                    <td className="px-3 py-2 text-left">{instrument.base_asset}</td>
                                    <td className={`flex flex-row items-center gap-2 px-3 py-2 text-left before:content-[''] before:h-[8px] before:w-[8px] before:rounded-full ${ instrument.is_active ? "before:bg-green-600" : "before:bg-red-500"}`}>{instrument.is_active === true ? 'Active': 'Inactive'}</td>
                                    <td className="px-3 py-2 text-left">{instrument.quote_currency}</td>
                                    <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{instrument.max_leverage}</td>
                                    <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{instrument.min_quantity}</td>
                                    <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{formatPrice(instrument.fees_per_unit)}</td>
                                    <td className="px-3 py-2 text-">
                                        <div className="flex items-center gap-2 mx-1">
                                            <button 
                                                className="text-blue-700 text-lg"
                                                onClick={() => navigate(`/instrument/details/${instrument.id}`)}
                                            >
                                                <AiOutlineEye/>
                                            </button>
                                            <button 
                                                className="text-yellow-600 text-lg"
                                                onClick={() => navigate(`/instrument/edit/${instrument.id}`)}
                                            >
                                                <AiOutlineEdit/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}
        </div>
    );
};


export default Instruments;