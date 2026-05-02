import { useNavigate } from "react-router-dom";


const AdminDashboard = () => {
    const naviagte = useNavigate();

    return (
        <div className='mx-auto w-full max-w-[580px] p-4'>
            <div className="flex w-full flex-col gap-5 rounded-xl border border-gray-300 bg-gray-50 p-5 shadow-xs">
                <div className="text-lg font-semibold text-gray-700">
                    Admin Dashboard
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => naviagte('/admin/instruments')}
                        className="cursor-pointer p-2 border rounded-lg font-medium text-gray-800 border-gray-400 hover:border-gray-500 active:scale-98 bg-white flex flex-col items-center gap-2 transition-colors transition-transform duration-300"
                    >
                        Instruments
                    </button>
                    <button
                        type="button"
                        onClick={() => naviagte('/admin/instrument/create')}
                        className="cursor-pointer p-2 border rounded-lg font-medium text-gray-800 border-gray-400 hover:border-gray-500 active:scale-98 bg-white flex flex-col items-center gap-2 transition-colors transition-transform duration-300"
                    >
                        Add Instrument
                    </button>    
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;