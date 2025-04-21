import PropTypes from 'prop-types';
import { useTemperatureUnit } from "./contexts/useTemperatureUnit";
import { renderTemperature } from './utils/renderTemperature';

function ForecastCards({ forecast }) {

    const { isCelsius } = useTemperatureUnit();
    
    // Funzione per formattare data (ie: Tue 12)
    const createDate = (dt) => {
    
        // Directly create a Date object from the ISO string
        const day = new Date(dt);
        
        // Check if the date is invalid
        if (isNaN(day)) {
            console.error("Invalid date:", dt);
            return "Invalid Date";  // Return some fallback if the date is invalid
        }
    
        const options = { weekday: 'short' };
        const shortDay = day.toLocaleDateString('en-US', options);
        const dayOfMonth = day.getDate();
        
        return `${shortDay} ${dayOfMonth}`;
    };

    const array_7 = forecast.slice(1, 8);
    const array_14 = forecast.slice(8, 15);

    // Funzione renderizzazione cards
    const renderCards = (items, isFirstRow = false) => {
    return items.map((item, idx) => {
        const isHoverable = isFirstRow && idx < 5;

        return (
            <div
                className={`flex flex-col items-center ring-2 ring-blue-400 ring-opacity-40 rounded-md p-2 w-20 h-28 transition duration-200 ${
                    isHoverable ? "bg-slate-50 hover:ring-yellow-300 hover:bg-yellow-100 cursor-pointer" : ""
                }`}
                key={idx}
            >
                <span className="font-semibold text-sm">{createDate(item.date)}</span>
                <i
                    className={`owi owi-${item.icon}`}
                    style={{ fontSize: "30px", marginTop: "10px", marginBottom: "15px" }}
                ></i>
                <span className="font-normal text-xs flex justify-center w-full">
                    <p>{renderTemperature(item.t_min, isCelsius)}{isCelsius ? "°C" : "°F"}</p>
                    <p>&nbsp;/&nbsp;</p>
                    <p>{renderTemperature(item.t_max, isCelsius)}{isCelsius ? "°C" : "°F"}</p>
                </span>
            </div>
        );
    });
    };

    return (
        <>
            <div className="flex flex-col items-center">
                <div className="flex flex-row justify-center space-x-4 mb-2"> {/* Prima riga */}
                    {renderCards(array_7, true)}
                </div>
                <div className="flex flex-row justify-center space-x-4"> {/* Seconda riga */}
                    {renderCards(array_14)}
                </div>
            </div>
        </>
    );
}

ForecastCards.propTypes = {
    forecast: PropTypes.arrayOf(
        PropTypes.shape({
            city: PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                state: PropTypes.string.isRequired,
                country: PropTypes.string.isRequired,
                lat: PropTypes.string.isRequired, // lat is a string (or it could be a number depending on the structure, but it's a string in the example)
            }).isRequired,
            date: PropTypes.string.isRequired, // ISO date string
            icon: PropTypes.string.isRequired, // Icon code (e.g., "04d")
            t_max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Max temperature, string or number
            t_min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Min temperature, string or number
        })
    ).isRequired,
};

export default ForecastCards;