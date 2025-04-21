import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CurrentCityContext = createContext();

export const CurrentCityProvider = ({ children }) => {
    const [currentCity, setCurrentCity] = useState(null);
    

    return (
        <CurrentCityContext.Provider value={{ currentCity, setCurrentCity }}>
            {children}
        </CurrentCityContext.Provider>
    );
};

// PropTypes validation
CurrentCityProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };
  
  export default CurrentCityProvider;