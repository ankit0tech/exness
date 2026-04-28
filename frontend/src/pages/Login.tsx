import { useGoogleLogin } from "@react-oauth/google";
import Button from "../components/Button";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import tradingImg from "../assets/trading.png";


interface JwtPayload {
    email: string,
    userId: string
};


const Login = () => {

    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (loginCredentials) => {
            try {
                const response = await api.post('/auth/login/federated/google', {
                    token: loginCredentials.access_token
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const jwtToken = response.data.token;

                if(jwtToken) {
                    const tokenData = jwtDecode<JwtPayload>(jwtToken);
                    
                    localStorage.setItem('authToken', jwtToken);
                    localStorage.setItem('email', tokenData.email);
        
                    navigate('/');
                }                
            } catch (error) {
                enqueueSnackbar("login with google failed", { variant: 'error'});
            }
        },
        onError: (error) => {
            console.log("Error:", error);
        },
        scope: 'openid email',
    });


    return (
        <div className="flex flex-col gap-4 w-full min-w-[320px] items-center p-4">

            <div className="mx-auto text-md text-gray-900">Start your trading journey today</div>

            <Button onClick={login} >
                Login with google
            </Button>

            <img 
                src={tradingImg} 
                alt="Trading illustrations" 
                className="w-full max-w-4xl h-auto object-contain border border-gray-300 rounded-md"    
            />

        </div>
    );
}

export default Login;