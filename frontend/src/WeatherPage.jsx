import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/useAuth.jsx';
import { useCurrentCity } from './contexts/useCurrentCity.jsx';
import { useTemperatureUnit } from './contexts/useTemperatureUnit.jsx';
import './styles.css';
import { FaRegCircleUser, FaPowerOff } from "react-icons/fa6";
import ForecastCards from './ForecastCards.jsx';
import Credit from './Credit.jsx';
import SearchBar from './SearchBar.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import HourlyForecast from './HourlyForecast.jsx';
import { renderTemperature } from './utils/renderTemperature.js';
import PropTypes from "prop-types";
import App from "./App.jsx";

function WeatherPage({ setCurrentWeather }) {
  const [localWeather, setLocalWeather] = useState({});
  const [myFavs, setMyFavs] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [hourlies, setHourlies] = useState([]);
  const { currentCity, setCurrentCity } = useCurrentCity();
  const { token, logout } = useAuth();
  const { isCelsius, toggleTemperatureUnit } = useTemperatureUnit();
  const navigate = useNavigate();

  // handleUserDetailsClick -------------------------------------
  const handleUserDetailsClick = () => {
    navigate('/user');
  };

  // Format date -------------------------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);  // Convert string to Date object
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const time = String(date.toLocaleTimeString()).padStart(2, '0');
    return `${time} - ${day}/${month}/${year}`;
  };

  // Fetch current city from IP -------------------------------------
  useEffect(() => {
    if (!token) return;

    async function fetchCurrentCity() {
      try {
        const response = await fetch('http://localhost:8000/api/create-city-from-ip/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + token,
            },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch city data");
        }

        const data = await response.json();

        if (!data.city_data || !data.city_data.lat || !data.city_data.lon) {
          throw new Error("City data is missing lat or lon");
        }

        setCurrentCity({
          name: data.city_data.name,
          state: data.city_data.state || "",
          country: data.city_data.country || "",
          lat: data.city_data.lat,
          lon: data.city_data.lon,
        });

      } catch (error) {
        console.error("Error fetching city:", error);
      }
    }

    fetchCurrentCity();
  }, [token, setCurrentCity]);

  // RefreshFavorites -------------------------------------
  async function refreshFavorites() {
    try {
        const response = await fetch('http://localhost:8000/api/favouritecities/', {
            headers: {
                'Authorization': 'Token ' + token,
            },
        });
        if (response.ok) {
            const data = await response.json();
            setMyFavs(data);
        } else {
            console.error('Failed to refresh favorites:', response.statusText);
        }
    } catch (error) {
        console.error('Error refreshing favorites:', error);
    }
  }

  // getCurrentWeather -------------------------------------
  useEffect(() => {
    if (!token || !currentCity) return;

    async function getCurrentWeather() {
      try {
        const lat = currentCity.lat;
        const lon = currentCity.lon;

        const response = await fetch(`http://localhost:8000/api/currentweather/get_weather_by_city/?lat=${lat}&lon=${lon}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setLocalWeather(data);
        setCurrentWeather(data);

      } catch (error) {
        console.error('Error fetching weather data:', error.message);
      }
    }

    getCurrentWeather();
  }, [token, currentCity]);

  // getForecast -------------------------------------
  useEffect(() => {
    if (!token || !currentCity) return;

    async function getForecast() {
      try {
        const lat = currentCity.lat;
        const lon = currentCity.lon;
        const response = await fetch(`http://localhost:8000/api/forecast/get_forecast_by_city/?lat=${lat}&lon=${lon}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + token,
          },
        });

        if (!response.ok) {
          const error = response.error;
          throw new Error('Failed to fetch forecast:', error);
        }

        const data = await response.json();
        setForecast(data);
      } catch (error) {
        console.error('Error fetching forecast:', error.message);
      }
    }

    getForecast();
  }, [token, currentCity]);

  // getHourly -------------------------------------
  useEffect(() => {
  if (!token || !currentCity) return;

  async function getHourly() {
  console.log("Fetching hourly forecast for:", currentCity?.name);

  try {
    const lat = currentCity.lat;
    const lon = currentCity.lon;
    const response = await fetch(`http://localhost:8000/api/hourly/get_hourly_by_city?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hourly data');
    }

    let data = await response.json();
    console.log("Fetched data before filtering:", data);

    // 🔥 Rimuove i duplicati basandosi sulla data
    const uniqueData = data.filter((item, index, self) =>
      index === self.findIndex((t) => t.date === item.date)
    );

    console.log("Filtered data:", uniqueData);
    setHourlies(uniqueData);

  } catch (error) {
    console.error('Error fetching hourly:', error.message);
  }
}
  setHourlies([]); // ✅ Resetta i dati prima di aggiornarli
  getHourly();
}, [token, currentCity]);

  return (
    <>
        <div className="flex flex-col items-center justify-center min-h-screen p-10">
          <div className="w-full max-w-screen-md bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">
            <nav className="bg-white border-gray-200 dark:bg-gray-900">
              <div className="max-w-screen-xl flex bg-white items-center justify-between mx-auto p-4">
                <div className="flex items-center w-full">
                  <button
                    className="flex items-center bg-blue-400 hover:bg-blue-700 px-4 py-2 rounded"
                    onClick={handleUserDetailsClick}
                  >
                    <FaRegCircleUser size="1.2em" color="white" />
                  </button>

                  <div className="flex-grow mx-7">
                    <SearchBar />
                  </div>

                  <button
                    className="flex items-center bg-blue-400 hover:bg-blue-700 px-4 py-2 rounded"
                    onClick={logout}
                  >
                    <FaPowerOff size="1.2em" color="white" />
                  </button>
                </div>
              </div>
            </nav>

            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <FavoriteButton favs={myFavs} onFavoritesChange={refreshFavorites} />
              </div>
              {currentCity ? (
                <>
                  <div className="text-center mx-10">
                    <p className="font-semibold ml-2 mb-1 text-xl">
                      {currentCity.name}, {currentCity.state}, {currentCity.country}
                    </p>
                    <p className="font-light ml-2 mb-1 text-xs text-gray-500">
                      last updated: {formatDate(localWeather.date)}
                    </p>
                  </div>
                  <div className="text-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!isCelsius}
                        onChange={toggleTemperatureUnit}
                        className="sr-only peer"
                      />
                      <div className="relative w-14 h-8 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors">
                        <div
                          className={`absolute top-1 left-1 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                            isCelsius ? 'translate-x-0' : 'translate-x-6'
                          }`}
                        >
                          {isCelsius ? 'C°' : 'F°'}
                        </div>
                      </div>
                    </label>
                  </div>
                </>
              ) : (
                <p className="text-center">No city selected</p>
              )}
            </div>

            <div className="flex justify-between items-start mx-auto my-auto w-full">
              <div className="flex items-center ml-4">
                <i
                  className={`owi owi-${localWeather.icon}`}
                  style={{ fontSize: '84px', marginRight: '0.1em', marginTop: '0.2em' }}
                ></i>

                <div className="flex flex-col items-start ml-3 mt-4">
                  <p className="text-3xl font-semibold">
                    {renderTemperature(localWeather.current_t, isCelsius)} {isCelsius ? '°C' : '°F'}
                  </p>

                  <p className="text-md text-gray-500">
                    {renderTemperature(localWeather.t_min, isCelsius)} {isCelsius ? '°C' : '°F'} /{' '}
                    {renderTemperature(localWeather.t_max, isCelsius)} {isCelsius ? '°C' : '°F'}
                  </p>

                  <p className="text-pink-600 text-lg">{localWeather.desc}</p>
                </div>
              </div>

              <div className="flex flex-col items-start mr-4 mt-2 text-sm">
                <span>
                  <span className="font-medium">Wind:</span> {localWeather.wind}
                </span>
                <span>
                  <span className="font-medium">Humidity:</span> {localWeather.humidity}%
                </span>
                <span>
                  <span className="font-medium">Chance of precipitation:</span> {localWeather.pop}%
                </span>
                <span>
                  <span className="font-medium">Pressure:</span> {localWeather.pressure} hPa
                </span>
                <span>
                  <span className="font-medium">Feels like:</span> {renderTemperature(localWeather.feels_like, isCelsius)}{' '}
                  {isCelsius ? '°C' : '°F'}
                </span>
              </div>
            </div>

            <HourlyForecast hourlies={hourlies} />
            <br />
            <hr />
            <br />
            <ForecastCards forecast={forecast} />
          </div>
        </div>

      <footer>
        <Credit />
      </footer>
    </>
  );
}

WeatherPage.propTypes = {
  setCurrentWeather: PropTypes.func.isRequired,
};

export default WeatherPage;