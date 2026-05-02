import { enqueueSnackbar } from "notistack";
import api from "../utils/api";


interface OverlayProps {
    deleteUrl: string;
    itemName?: string;
    isOpen: boolean;
    onClose: () => void;
    onDeleteSuccess?: () => void
}

const DeleteOverlay: React.FC<OverlayProps> = ({ deleteUrl, itemName, isOpen, onClose, onDeleteSuccess }) => {
    
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }
    

    const handleDelete = () => {

        api.delete(deleteUrl)
        .then((_response) => {
            
            enqueueSnackbar(`Deleted ${itemName || 'item'} successfully`, { variant: 'success'});
            onClose();
            onDeleteSuccess?.();
        })
        .catch((error: any) =>{
            console.error(error);
            enqueueSnackbar(error?.response?.data?.message || `Error while deleting ${itemName || 'item'}`, { variant: 'error' });
        });
    }

    return (
        <>
            {isOpen ?
            <div className="fixed inset-0 flex items-center justify-center z-50">
                {/* backdrop with fade animation */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out"
                    onClick={handleOverlayClick}
                />
                {/* Dialog with scale and fade animation */}
                <div className="relative flex flex-col bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 transition-all duration-300 ease-in-out">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-medium text-gray-800 mb-2">Confirm Deletion</h3>
                        <p className="text-gray-600 whitespace-normal">
                            {`Are you sure you want to delete ${itemName || "item"}? This action can't be undone.`}
                        </p>
                    </div>
                    <div className="flex gap-4 justify-end">
                        <button
                            className="py-2 px-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            type="button"
                            onClick={() => onClose()}
                        >
                            Cancel
                        </button>
                        <button
                            className="py-2 px-6 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                            type="button"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                
            </div>: null
            }
        </>
    );
}

export default DeleteOverlay;