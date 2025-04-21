import PropTypes from 'prop-types';
import { TiDelete } from "react-icons/ti";

function DeleteFavCityModal({ onConfirm, onCancel, message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative p-7 w-full max-w-md bg-white rounded-lg shadow-md">
        <button onClick={onCancel} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <TiDelete size="1.2em" color="red" />
        </button>
        <p className="text-center text-lg">{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button onClick={onConfirm} className="px-6 py-2 bg-red-500 text-white rounded-lg">Yes, delete it</button>
          <button onClick={onCancel} className="px-6 py-2 bg-gray-500 text-white rounded-lg">No, cancel</button>
        </div>
      </div>
    </div>
  );
}

// Adding PropTypes validation for the props
DeleteFavCityModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,  // onConfirm should be a function and is required
  onCancel: PropTypes.func.isRequired,   // onCancel should be a function and is required
  message: PropTypes.string.isRequired,  // message should be a string and is required
};

export default DeleteFavCityModal;