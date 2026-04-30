import { useEffect, useState } from 'react';
import api from '../utils/api';
import { enqueueSnackbar } from 'notistack';
import { formatPrice } from '../utils/formatUtils';
import type { Account } from '../utils/types';

const AccountDetails = () => {

    const [accountDetails, setAccountDetails] = useState<Account|null>(null);
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

    const updateBalance = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        if(amount === 0) {
            enqueueSnackbar("Enter a valid amount", { variant: "error"});
            return;
        }

        const data = {
            amount : (amount * (10**6))
        }

        api.post('/account/update-balance', data)
        .then((_response) => {
            enqueueSnackbar("Update balance successfully", {variant: "success"});
            fetchAccountDetails();
        })
        .catch((error: any)=> {
            console.log(error.message);
            enqueueSnackbar("Error while updating balance", {variant: "error"});
        });
    }

    const createAccount = () => {
        
        api.post('/account/create')
        .then((_response) => {
            enqueueSnackbar("created account successfully", {variant: "success"});
            fetchAccountDetails();
        })
        .catch((error: any)=> {
            console.log(error.message);
            enqueueSnackbar("Error while creating account", {variant: "error"});
        });
    }

    
    return (
        <div className='mx-auto w-full max-w-[580px] p-4'>
            {!accountDetails ? (
                <div className='mx-auto flex w-full flex-col gap-4 rounded-xl border border-gray-300 bg-gray-500 p-5 text-center shadow-xs'>
                    <h1 className='text-lg font-semibold text-gray-800'>Account Details</h1>
                    <p className='text-sm text-gray-600'>No account found for this user yet.</p>
                    <button
                        type="button"
                        onClick={createAccount}
                        className='mx-auto w-fit cursor-pointer rounded-md border border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] px-4 py-2 text-sm font-medium text-white transition-transform transition-colors duration-300 active:scale-98'
                    >
                        Create empty account
                    </button>
                </div>
            ) : (
                <div className='flex w-full flex-col gap-5 rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-xs'>
                    <div className='flex items-center justify-between gap-2'>
                        <h1 className='text-lg font-semibold text-gray-800'>Account Details</h1>
                        <span className='rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-600'>USD Wallet</span>
                    </div>

                    <div className='w-full'>
                        <h2 className='mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600'>Account Overview</h2>
                        <dl className='flex w-full flex-col gap-2 text-sm'>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3'>
                                <dt className='text-gray-600 font-medium'>Balance</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.balance)}</dd>
                            </div>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3'>
                                <dt className='text-gray-600 font-medium'>Used Margin</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.used_margin)}</dd>
                            </div>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3'>
                                <dt className='text-gray-600 font-medium'>Free Margin</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.free_margin)}</dd>
                            </div>
                        </dl>
                    </div>

                    <form 
                        className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white p-4"
                        onSubmit={(e) => {updateBalance(e)}}
                    >
                        <div className='flex flex-col gap-2'>
                            <label 
                                className="text-gray-600 text-sm font-medium"
                                htmlFor="amount"
                            > 
                                Amount (USD)
                            </label>
                            <input 
                                id="amount"
                                className="h-10 rounded-md border border-gray-300 px-3 outline-hidden"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={amount === 0}
                            className='self-end w-fit cursor-pointer rounded-md border border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] px-4 py-2 text-sm font-medium text-white transition-transform transition-colors duration-300 active:scale-98 disabled:cursor-not-allowed disabled:opacity-70'
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