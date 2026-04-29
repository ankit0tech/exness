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
        <div className='w-full max-w-[520px] p-4'>
            {!accountDetails ? (
                <section className='mx-auto flex w-full flex-col gap-4 rounded-md border border-gray-300 bg-gray-100 p-4 text-center'>
                    <h2 className='text-base font-medium text-gray-800'>No account found</h2>
                    <button
                        type="button"
                        onClick={createAccount}
                        className="mx-auto w-fit px-4 py-2 text-white bg-yellow-500 cursor-pointer border border-gray-800 active:scale-98 transition-transform duration-300"
                    >
                        Create empty account
                    </button>
                </section>
            ) : (
                <section className='flex w-full flex-col gap-4 rounded-md border border-gray-300 bg-gray-100 p-4 shadow-sm'>
                    <div className='w-full'>
                        <h2 className='mb-2 text-base font-medium text-gray-800'>Account Overview</h2>
                        <dl className='flex w-full flex-col gap-2 text-sm'>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white p-3'>
                                <dt className='text-gray-600 font-medium'>Balance</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.balance)}</dd>
                            </div>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white p-3'>
                                <dt className='text-gray-600 font-medium'>Used Margin</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.used_margin)}</dd>
                            </div>
                            <div className='flex items-center justify-between rounded-md border border-gray-300 bg-white p-3'>
                                <dt className='text-gray-600 font-medium'>Free Margin</dt>
                                <dd className='font-medium tabular-nums'>{formatPrice(accountDetails.free_margin)}</dd>
                            </div>
                        </dl>
                    </div>

                    <form 
                        className="flex flex-col gap-4 rounded-sm border border-gray-300 bg-white p-3"
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
                                className="px-4 py-2 rounded-sm border border-gray-300 outline-hidden"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={amount === 0}
                            className='self-end w-fit cursor-pointer text-sm font-medium border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] text-white'
                        >
                            Update Balance
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}

export default AccountDetails;