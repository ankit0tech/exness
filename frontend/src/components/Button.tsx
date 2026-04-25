
const Button = ({onClick, children}: {onClick: () => void, children: string}) => {
    
    
    return (
        <button 
            type='button' 
            onClick={onClick}
            className="px-4 py-2 text-white bg-gray-800 hover:bg-gray-900 active:bg-gray-950 border-2 border-blue-800 rounded-md"
        >
            {children}
        </button>
    );
}

export default Button;