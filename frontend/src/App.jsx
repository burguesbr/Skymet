import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {useAuth} from './contexts/useAuth.jsx';
import UserDetails from './UserDetails.jsx';
import WeatherPage from './WeatherPage.jsx';
import LoginRegister from './LoginRegister.jsx';
import getBackgroundImage from './utils/getBackgroundImage'; // Importa la funzione per lo sfondo
import PropTypes from 'prop-types'; // Importa PropTypes

function App() {
  const { token } = useAuth();
  const [currentWeather, setCurrentWeather] = useState({});

  useEffect(() => {
     // Default background image path
    let backgroundImage = "/images/bg/default.jpg";

    // Debugging log to ensure currentWeather is being passed correctly
    console.log("Current Weather in App:", currentWeather);

    // If we have currentWeather and it contains an icon, change the background based on it
    if (currentWeather?.icon) {
      backgroundImage = getBackgroundImage(currentWeather.icon);
    }

    // Apply the background with a smooth transition
    document.body.style.transition = "background-image 1s ease-in-out";
    document.body.style.backgroundImage = `url(${backgroundImage})`;

  }, [currentWeather]); // Runs when currentWeather changes

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={token ? <WeatherPage setCurrentWeather={setCurrentWeather} /> : <LoginRegister />} />
          <Route path="/user" element={token ? <UserDetails /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

// Convalida della prop 'currentWeather'
App.propTypes = {
  currentWeather: PropTypes.shape({
    icon: PropTypes.string.isRequired,  // Verifica che ci sia un 'icon' come stringa
    // Puoi aggiungere altre proprietà se 'currentWeather' ha più dati, per esempio:
    // temperature: PropTypes.number.isRequired,
  }).isRequired,
};

export default App;
