import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { enqueueSnackbar } from 'notistack';

const InstrumentCreate = () => {

    const { id } = useParams();
    const [isLoading, setIsLoading]= useState<boolean>(false);
    const [createInstrument, setCreateInstrument] = useState<boolean>(true);

    const [symbol, setSymbol] = useState<string>('');
    const [baseAsset, setBaseAsset] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [quoteCurrency, setQuoteCurrency] = useState<string>('');
    const [maxLeverage, setMaxLeverage] = useState<string>('');
    const [minQuantity, setMinQuantity] = useState<string>('');
    const [feesPerUnit, setFeesPerUnit] = useState<string>('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});


    const validateForm = ():boolean => {
        const newErrors: Record<string, string> = {};

        if(!symbol.trim()) {
            newErrors.symbol = 'Symbol is required';
        }

        if(!baseAsset.trim()) {
            newErrors.baseAsset = 'Base Asset is required';
        }
        
        if(!quoteCurrency.trim()) {
            newErrors.quoteCurrency = 'Quote Currency is required';
        }
        
        if(maxLeverage != '' && (isNaN(Number(maxLeverage)) || Number(maxLeverage) <= 0)) {
            newErrors.maxLeverage = 'Invalid maximum leverage'
        }

        if(minQuantity != '' && (isNaN(Number(minQuantity)) || Number(minQuantity) <= 0)) {
            newErrors.pages = 'Invalid minimum quantity'
        }

        if(feesPerUnit != '' && (isNaN(Number(feesPerUnit)) || Number(feesPerUnit) <= 0)) {
            newErrors.feesPerUnit = 'Invalid fees per unit'
        }
        
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!validateForm()) {
            return;
        }

        const data = {
            symbol,
            base_asset: baseAsset,
            quote_currency: quoteCurrency,
            is_active: isActive,
            max_leverage: Number(maxLeverage),
            min_quantity: Number(minQuantity),
            fees_per_unit: Number(feesPerUnit)
        };
        
        const url = createInstrument ? 'instrument/create' : `instrument/update/${id}`;

        api.post(url, data)
        .then((_response) => {
            console.log(_response);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar(`Error while ${createInstrument ? 'creating' : 'updating'} instrument`, { variant: "error" });
        });

    }


    const fetchInstrument = (id: string) => {
        setIsLoading(true);
        
        api.get(`instrument/${id}`)
        .then((response) => {
            console.log(response);

            setCreateInstrument(false);
            
            setSymbol(response.data.symbol);
            setBaseAsset(response.data.base_asset);
            setIsActive(response.data.is_active);
            setQuoteCurrency(response.data.quote_currency);
            setMaxLeverage(response.data.max_leverage);
            setMinQuantity(response.data.min_quantity);
            setFeesPerUnit(response.data.fees_per_unit);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error while fetching Instrument details', { variant: "error" });
        })
        .finally(() => {
            setIsLoading(false);
        });

    }

    useEffect(() => {
        if(id) {
            fetchInstrument(id);
        }
    }, [id])

    return (
        <div className='p-4 sm:p-4 max-w-2xl mx-auto flex flex-col gap-4'>
            <div className='text-xl font-semibold text-gray-700'>
                {createInstrument ? 'Create Instrument' : 'Update Instrument'}
            </div>
            {isLoading ? (
                <div className='text-sm text-gray-700 font-medium'>Loading...</div>
            ) : (
                <form 
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-4'
                >
                    <div
                        className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-end'
                    >
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-symbol'
                            >Symbol</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="text"
                                id="input-symbol"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                            >
                            </input>
                            { formErrors.symbol && (<p className='text-sm text-red-500 mt-1'> {formErrors.symbol} </p>) }
                        </div>
    
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-base-asset'
                            >Base Asset</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="text"
                                id="input-base-asset"
                                value={baseAsset}
                                onChange={(e) => setBaseAsset(e.target.value)}
                                >
                            </input>
                        </div>
                        
    
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-quote-currency'
                            >Quote Currency</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="text"
                                id="input-quote-currency"
                                value={quoteCurrency}
                                onChange={(e) => setQuoteCurrency(e.target.value)}
                                >
                            </input>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-is-active'
                            >Is Active</label>
                            <div className='flex items-center mt-2 space-x-3'>
                                <button 
                                    className={`inline-flex items-center rounded-full transition-colors duration-200 ease-out w-11 h-6 ${isActive ? 'bg-blue-600' : 'bg-gray-200'} focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                    type='button'  
                                    onClick={() => setIsActive(!isActive)}  
                                >
                                    <span className={`inlne-block rounded-full h-4 w-4 bg-white transform transition-transform duration-200 ease-out ${isActive ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                </button>
                                <span className={`text-md ${isActive ? 'text-green-500' : 'text-gray-500'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                         </div>
                         
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-max-leverage'
                            >Max Leverage</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="number"
                                id="input-max-leverage"
                                value={maxLeverage}
                                onChange={(e) => setMaxLeverage(e.target.value)}
                                >
                            </input>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-min-quantity'
                            >Minimum Quantity</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="number"
                                id="input-min-quantity"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                            >
                            </input>
                        </div>
    
                        <div className='flex flex-col gap-1'>
                            <label 
                                className='block text-sm font-medium text-gray-700'
                                htmlFor='input-fees-per-unit'
                            >Fees Per Unit</label>
                            <input
                                className="appearance-none rounded-sm px-3 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                                type="number"
                                id="input-fees-per-unit"
                                value={feesPerUnit}
                                onChange={(e) => setFeesPerUnit(e.target.value)}
                                >
                            </input>
                        </div>
                    </div>
    
                    <button
                        type='submit'
                        className='w-fit cursor-pointer text-sm font-medium border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] text-white'
                    >
                        Submit
                    </button>
    
                </form>

            )}
        </div>
    );
}

export default InstrumentCreate;