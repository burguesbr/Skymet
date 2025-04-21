import { useContext } from 'react';
import { CurrentCityContext } from './CurrentCityContext';

export const useCurrentCity = () => {
    return useContext(CurrentCityContext);
};