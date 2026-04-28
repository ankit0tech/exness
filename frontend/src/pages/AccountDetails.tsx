import { useEffect, useState } from 'react';
import api from '../utils/api';
import { enqueueSnackbar } from 'notistack';
import { formatPrice } from '../utils/formatUtils';

const AccountDetails = () => {

    const [accountDetails, setAccountDetails] = useState(null);
    const [amount, setAmount] = useState(0);
    
    useEffect(() => {
        fetchAccountDetails();
    }, []);

    const fetchAccountDetails= () => {
        api.get('account/details')
        .then((response) => {
            setAccountDetails(response.data.account);
        })
        .catch((error: any) => {
            console.log(error.message);
            enqueueSnackbar('Error fetching account details', {variant: "error"});
        });
    }

    const updateBalance = (e: React.SubmitEvent) => {
        e.preventDefault();


        const data = {
            amount : (amount * (10**6))
        }

        api.post('/account/update-balance', data)
        .then((response) => {
            enqueueSnackbar("Update balance successfully", {variant: "success"});
            fetchAccountDetails();
        })
        .catch((error: any)=> {
            console.log(error.message);
            enqueueSnackbar("Error while updating balance", {variant: "error"});
        });
    }

    
    return (
        <div className='p-4 min-w-[320px] max-w-[480px]'>
            {!accountDetails ? (
                <div className='text-sm text-gray-700'>No account found</div>
            ) : (
                <div className='w-full flex flex-col gap-4 rounded-md bg-slate-100 border border-gray-300 p-4'>
                    <div className='w-full flex flex-col gap-2'>
                        <div className='bg-white w-full flex gap-2 justify-between p-2 rounded-md border border-gray-300'>
                            <div className='px-4 py-2 text-gray-700'>Balance:</div>
                            <div className='px-4 py-2'>{formatPrice(accountDetails.balance)}</div>
                        </div>
                        <div className='bg-white w-full flex gap-2 justify-between p-2 rounded-md border border-gray-300'>
                            <div className='px-4 py-2 text-gray-700'>Used Margin:</div>
                            <div className='px-4 py-2'>{formatPrice(accountDetails.used_margin)}</div>
                        </div>
                        <div className='bg-white w-full flex gap-2 justify-between p-2 rounded-md border border-gray-300'>
                            <div className='px-4 py-2 text-gray-700'>Free Margin:</div>
                            <div className='px-4 py-2'>{formatPrice(accountDetails.free_margin)}</div>
                        </div>
                    </div>

                    <form 
                        className="bg-white flex flex-col gap-4 rounded-sm border border-gray-300 p-2"
                        onSubmit={(e) => {updateBalance(e)}}
                    >
                        <div className='flex flex-col gap-2'>
                            <label 
                                className="text-gray-700"
                                htmlFor="amount"
                            > 
                                Amount:
                            </label>
                            <input 
                                id="amount"
                                className="px-4 py-2 rounded-sm border border-gray-300 outline-hidden"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>

                        <button
                            type="submit"
                            className="self-end px-4 py-2 text-white bg-yellow-500 cursor-pointer border border-gray-800 active:scale-98 transition-transform duration-300"
                        >
                            Update Balance
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AccountDetails;