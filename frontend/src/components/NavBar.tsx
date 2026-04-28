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
    const profileMenuRef = useRef(null);

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
            className="flex flex-row items-center justify-between h-14 border-b-[1.5px] border-gray-300"
        >
            <button 
                type="button"
                className="py-3 px-4 cursor-pointer font-medium _bg-gray-50 text-gray-950 truncate"
                onClick={() => {navigate("/")}}
            >
                <FaHome className="text-3xl text-yellow-500"/>
            </button>

            <div 
                className="pr-8"
                ref={profileMenuRef}
            >
                <AiOutlineUser
                    className="text-2xl text-gray-700 hover:text-gray-950 cursor-pointer"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                </AiOutlineUser>

                <div className={`absolute z-50 right-0 mt-2 rounded-md overflow-hidden shadow-lg transition-opacity duration-200 ease-out ${showProfileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                    <div className={`flex flex-col items-center rounded-md overflow-hidden border border-gray-300 bg-white transition-opacity transition-transform duration-200 ease-out ${showProfileMenu ? 'opacity-100 scale-100 transform-y-0' : 'opacity-0 scale-95 transform-y-1 border-transparent'}`}>   
                        <div 
                            className="py-3 px-4 font-medium _bg-gray-50 text-gray-950 truncate"
                        >
                            {usermail}
                        </div>
                        
                        <div className="border-t-[1.25px] border-gray-300 _mb-2 w-full -mx-2"></div>
                        
                        <div className="flex flex-col items-start w-full p-3">
                            <button 
                                type="button"
                                className="w-full text-left hover:bg-gray-50 py-1.75 px-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring hover:ring-gray-300"
                                onClick={() => {setShowProfileMenu(false); navigate('/account')}}
                            > 
                                Account 
                            </button> 
                            <button 
                                type="button"
                                className="w-full text-left hover:bg-gray-50 py-1.75 px-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring hover:ring-gray-300"
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
