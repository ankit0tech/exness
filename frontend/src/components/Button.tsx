
const Button = ({onClick, children}: {onClick: () => void, children: string}) => {
    
    
    return (
        <button 
            type='button' 
            onClick={onClick}
            className="mx-auto w-fit px-4 py-2 text-white bg-yellow-500 cursor-pointer border border-gray-800 active:scale-98 transition-transform duration-300"        >
            {children}
        </button>
    );
}

export default Button;