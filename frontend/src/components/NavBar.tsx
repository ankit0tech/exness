import { googleLogout } from "@react-oauth/google";
import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "../hooks/useClickOutside";
import { FaHome } from "react-icons/fa";


const NavBar = () => {

    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
    const usermail = localStorage.getItem("email") || "";
    const navigate = useNavigate();
    const profileMenuRef = useRef<HTMLDivElement | null>(null);

    useClickOutside(profileMenuRef, (event: MouseEvent|TouchEvent) => setShowProfileMenu(false));

    const handleSignout = async () => {
        try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('email');
            googleLogout();
            navigate('/login');
        
        } catch(error: any) {
            enqueueSnackbar("Error while loggin out", {variant: 'error'});
        }
    }

    return (
        <nav
            className="flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-white/80"
        >
            <button 
                type="button"
                className="group cursor-pointer rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-100"
                onClick={() => {navigate("/")}}
                aria-label="Home"
            >
                <FaHome className="text-2xl text-gray-700 transition-colors group-hover:text-gray-900" />
            </button>

            <div 
                className="relative pr-4"
                ref={profileMenuRef}
            >
                <button
                    type="button"
                    className="cursor-pointer rounded-full border border-gray-300 p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label="Open profile menu"
                >
                    <AiOutlineUser className="text-xl" />
                </button>

                <div className={`absolute right-0 z-50 mt-2 overflow-hidden rounded-md shadow-lg transition-opacity duration-200 ease-out ${showProfileMenu ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>

                    <div className={`flex min-w-[220px] flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 ease-out ${showProfileMenu ? 'trangray-y-0 scale-100 opacity-100' : 'trangray-y-1 scale-95 opacity-0 border-transparent'}`}>   
                        <div 
                            className="truncate border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-800"
                        >
                            {usermail}
                        </div>

                        <div className="flex w-full flex-col items-start p-2">
                            <button 
                                type="button"
                                className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100"
                                onClick={() => {setShowProfileMenu(false); navigate('/account')}}
                            > 
                                Account 
                            </button> 
                            <button 
                                type="button"
                                className="w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-600 transition-colors duration-200 hover:bg-red-50"
                                onClick={() => {setShowProfileMenu(false); handleSignout()}}
                            >
                                Signout
                            </button>
                        </div>
                    </div>

                </div>
 
            </div>
        </nav>
    );

};

export default NavBar;
