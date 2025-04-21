import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const TemperatureUnitContext = createContext();

export const TemperatureUnitProvider = ({ children }) => {
    const [isCelsius, setIsCelsius] = useState(true);

    const toggleTemperatureUnit = () => {
        setIsCelsius((prev) => !prev);
    };

    return (
        <TemperatureUnitContext.Provider value={{ isCelsius, toggleTemperatureUnit }}>
            {children}
        </TemperatureUnitContext.Provider>
    );
};

TemperatureUnitProvider.propTypes = {
    children: PropTypes.node.isRequired, // Ensure children is passed and can be any valid React node
};