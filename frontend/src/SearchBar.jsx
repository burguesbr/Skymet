import { useState, useEffect } from "react";
import { useCurrentCity } from './contexts/useCurrentCity';
import { useAuth } from './contexts/useAuth';
import { IoSearch } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";

function SearchBar() {
    const { token } = useAuth();
    const [query, setQuery] = useState(""); // Input value from user
    const [debouncedQuery, setDebouncedQuery] = useState(""); // Query with debounce
    const [results, setResults] = useState([]); // Results from OpenWeatherMap
    const [showDropdown, setShowDropdown] = useState(false); // Toggle dropdown visibility
    const [loading, setLoading] = useState(false); // Loading state for feedback
    const { setCurrentCity } = useCurrentCity();

    const API_KEY = import.meta.env.VITE_API_KEY;

    // Handle debounced input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 1500);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    // Fetch cities from OpenWeatherMap API
    useEffect(() => {
        const fetchCities = async () => {
            if (debouncedQuery) {
                setLoading(true);
                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/geo/1.0/direct?q=${debouncedQuery}&limit=5&appid=${API_KEY}`
                    );
                    const data = await response.json();
                    setResults(data);
                    setShowDropdown(true);
                } catch (error) {
                    console.error("Error fetching cities:", error);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        };

        fetchCities();
    }, [debouncedQuery, API_KEY]);

    // Handle city selection and send to internal API
    const handleSelectCity = async (city) => {
        if (!token) {
            console.error("You need to be logged in to create a city.");
            return;
        } else {
            setCurrentCity({
                name: city.name,
                state: city.state || "",
                country: city.country || "",
                lat: city.lat,
                lon: city.lon,
              });
        }

        try {
            const response = await fetch("http://localhost:8000/api/city/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Token ' + token,
                },
                body: JSON.stringify({
                    name: city.name,
                    state: city.state || "",
                    country: city.country || "",
                    lat: String(city.lat),
                    lon: String(city.lon),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to create city:", errorData);
                throw new Error("Failed to create city");
            }

            setShowDropdown(false); // Hide dropdown after selection
            setQuery(""); // Reset input after selection
        } catch (error) {
            console.error("Error creating city:", error);
        }
    };

    return (
        <div className="relative w-full max-w-md mx-6">
            {/* Show search icon or spinner based on loading state */}
            {!loading ? (
                <IoSearch 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '15px',
                        transform: 'translateY(-50%)',
                        color: '#aaa'
                    }}
                />
            ) : (
                <CgSpinner 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '15px',
                        transform: 'translateY(-50%)',
                        color: '#aaa',
                        animation: 'spin 1s linear infinite'
                    }}
                />
            )}

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, state, nation"
                className="w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:border-blue-500"
                onFocus={() => setShowDropdown(!!results.length)} // Show dropdown on focus
            />

            {loading && <p className="text-gray-500 mt-1">Loading...</p>}

            {/* Dropdown for displaying results */}
            {showDropdown && results.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-24 overflow-y-auto">
                    {results.map((city, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectCity(city)}
                            className="px-2 py-1 text-sm text-left hover:bg-blue-500 hover:text-white cursor-pointer"
                        >
                            {city.name}
                            {city.state ? `, ${city.state}` : ""}
                            {city.country ? `, ${city.country}` : ""}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;