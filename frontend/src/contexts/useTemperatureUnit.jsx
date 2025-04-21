import { useContext } from 'react';
import { TemperatureUnitContext } from './TemperatureContext';

export const useTemperatureUnit = () => {
    const context = useContext(TemperatureUnitContext);
    if (!context) {
        throw new Error("useTemperatureUnit must be used within a TemperatureUnitProvider");
    }
    return context;
};