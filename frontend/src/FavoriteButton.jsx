import { useState, useEffect } from 'react';
import { useAuth } from './contexts/useAuth'; // Custom hook to get auth token
import { useCurrentCity } from './contexts/useCurrentCity'; // Custom hook for current city context
import { FaRegHeart, FaHeart } from "react-icons/fa";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FavoriteButton({ favs, onFavoritesChange }) {
    const { token } = useAuth(); // Get token from auth context
    const { currentCity } = useCurrentCity(); // Get current city from context
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [favCityId, setFavCityId] = useState(null);

    // Effect to check if the current city is a favorite
    useEffect(() => {
        if (currentCity && favs) {
            const currentLat = parseFloat(currentCity.lat);
            const currentLon = parseFloat(currentCity.lon);
    
            const favoredCity = favs.find(favCity => {
                const favLat = parseFloat(favCity.city.lat);
                const favLon = parseFloat(favCity.city.lon);
    
                return favLat === currentLat && favLon === currentLon;
            });
    
            if (favoredCity) {
                setIsFavorite(true);
                setFavCityId(favoredCity.id); // Set the favorite city ID when found
            } else {
                setIsFavorite(false);
                setFavCityId(null); // Reset if city is not in favorites
            }
        }
    }, [currentCity, favs]); // Re-run when currentCity or favs change
    
    async function handleFavorite() {
        if (!currentCity) return; // Exit early if no city is selected
    
        setLoading(true); // Start loading state
        setMessage(""); // Reset any message
    
        try {
            let method;
            let url;
            let body;
    
            // If the city is already a favorite, remove it
            if (isFavorite) {
                // We need to make sure favCityId is valid before attempting to delete
                if (!favCityId) {
                    setMessage("City is not in favorites.");
                    return; // Exit early if no valid favCityId exists
                }
                // If the city is in favorites, send DELETE request
                method = 'DELETE';
                url = `http://localhost:8000/api/favouritecities/${favCityId}/`; // Delete based on favCityId
            } else {
                // If the city is not a favorite, add it
                method = 'POST';
                url = `http://localhost:8000/api/favouritecities/`; // Add a favorite city
    
                // Only include body in POST request
                body = JSON.stringify({
                    city: {
                        name: currentCity.name,
                        state: currentCity.state || '',
                        country: currentCity.country || '',
                        lat: currentCity.lat,
                        lon: currentCity.lon,
                    },
                });
            }
    
            // Perform the network request (POST or DELETE)
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token, // Pass the token for authentication
                },
                body: body, // Only include body in POST request
            });
    
            // Check the response status
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error during ${isFavorite ? 'removing' : 'adding'} city:`, errorText);
                toast.error(`Error during ${isFavorite ? 'removing' : 'adding'} city: ${response.statusText}`);
                return; // Exit early on error
            }
    
            // If it's a POST request (adding to favorites)
            if (!isFavorite) {
                const data = await response.json();
                setFavCityId(data.id);  // Get the new `favCityId` from the server response
                setIsFavorite(true);  // Mark as favorite
                toast.success("City successfully added to favorites!");
            } else {
                // If it's a DELETE request (removing from favorites)
                setFavCityId(null);  // Reset the `favCityId` as the city is removed from favorites
                setIsFavorite(false); // Mark as not a favorite
                toast.success("City successfully removed from favorites!");
            }

            if (onFavoritesChange) onFavoritesChange();
    
        } catch (error) {
            console.error("Error in handleFavorite:", error.message);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false); // End loading state
        }
    }   

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleFavorite}
                disabled={loading}
                className={`px-2 py-2 bg-gray-200 hover:bg-pink-200 rounded-full transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >   
                {favCityId ? (
                    <FaHeart size={24} className="text-pink-600"/>
                ) : (
                    <FaRegHeart size={24} className="text-black"/>
                )}               
            </button>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
            
            <ToastContainer autoClose={2000} theme="light" />
        </div>
    );
}

// PropTypes validation
FavoriteButton.propTypes = {
    favs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            state: PropTypes.string,
            country: PropTypes.string.isRequired,
            lat: PropTypes.number.isRequired,
            lon: PropTypes.number.isRequired,
        })
    ).isRequired, // `favs` is an array of city objects and is required
    onFavoritesChange: PropTypes.func.isRequired, // Add the callback as a required prop
};

export default FavoriteButton;