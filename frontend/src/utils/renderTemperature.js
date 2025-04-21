export const renderTemperature = (temperature, isCelsius) => {
    if (temperature == null || isNaN(temperature)) {
        // Fallback for invalid input
        return "--";
    }

    // Convert temperature to Celsius or Fahrenheit
    const convertedTemperature = isCelsius
        ? Math.round(temperature)
        : Math.round((temperature * 9) / 5 + 32);

    return convertedTemperature.toString(); // Return as string for JSX safety
};