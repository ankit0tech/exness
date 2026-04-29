
const Button = ({onClick, children}: {onClick: () => void, children: string}) => {
    
    
    return (
        <button 
            type='button' 
            onClick={onClick}
            className='w-fit cursor-pointer text-sm font-medium border rounded-sm outline-hidden text-white py-2 px-4 active:scale-98 transition-transform transition-colors duration-300 border-[hsla(209,95%,53%,1)] bg-[hsla(209,95%,53%,1)] text-white'
        >
            {children}
        </button>
    );
}

export default Button;