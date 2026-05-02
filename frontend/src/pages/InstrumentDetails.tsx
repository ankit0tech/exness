import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import type { Instrument } from "../utils/types";
import { formatPrice } from "../utils/formatUtils";


const InstrumentDetails = () => {
    
    const { id } = useParams();
    const [instrument, setInstrument] = useState<Instrument|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        if(!id) {
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        api.get(`/instrument/${id}`)
        .then((response) => {
            setInstrument(response.data);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar("Failed to load instrument details", { variant: "error" });
        })
        .finally(() => {
            setIsLoading(false);
        });

    }, [id]);


    return (
        <div className="mx-auto w-full max-w-[580px] p-4">
            {isLoading ? (
                <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                    Loading instrument details...
                </div>
            ) : !instrument ? (
                <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                    No instrument details to display.
                </div>
            ) : (
                <div className="flex flex-col gap-4 rounded-xl border border-gray-300 bg-gray-50 p-5 text-sm shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                        <h1 className="text-lg font-semibold text-gray-800">Instrument Details</h1>
                        <div className="w-fit rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600">
                            {instrument.quote_currency}
                        </div>
                    </div>

                    <dl className="flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Symbol</dt>
                            <dd className="font-medium text-gray-800">{instrument.symbol}</dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Base Asset</dt>
                            <dd className="font-medium text-gray-800">{instrument.base_asset}</dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Status</dt>
                            <dd className={`flex items-center gap-2 text-left font-medium ${instrument.is_active ? "text-green-700" : "text-red-600"}`}>
                                <span className={`h-2 w-2 rounded-full ${instrument.is_active ? "bg-green-600" : "bg-red-500"}`}></span>
                                {instrument.is_active ? "Active" : "Inactive"}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Quote Currency</dt>
                            <dd className="font-medium text-gray-800">{instrument.quote_currency}</dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Max Leverage</dt>
                            <dd className="font-medium text-gray-800">{instrument.max_leverage}</dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Min Quantity</dt>
                            <dd className="font-medium text-gray-800">{instrument.min_quantity}</dd>
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3">
                            <dt className="font-medium text-gray-600">Fees Per Unit</dt>
                            <dd className="font-medium text-gray-800 tabular-nums">{formatPrice(instrument.fees_per_unit)}</dd>
                        </div>
                    </dl>

                    <button
                        type="button"
                        onClick={() => navigate(`/instrument/edit/${instrument.id}`)}
                        className='self-end w-fit cursor-pointer rounded-md border border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] px-4 py-2 text-sm font-medium text-white transition-transform transition-colors duration-300 active:scale-98 disabled:cursor-not-allowed disabled:opacity-70'
                    >
                        Edit Instrument Details
                    </button>                    
                </div>
            )}
        </div>
    );
}

export default InstrumentDetails;