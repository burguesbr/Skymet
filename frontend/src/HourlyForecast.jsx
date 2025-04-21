import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, LabelList } from 'recharts';
import { useTemperatureUnit } from './contexts/useTemperatureUnit';
import { renderTemperature } from './utils/renderTemperature';

function HourlyForecast({ hourlies }) {
  const { isCelsius } = useTemperatureUnit(); // Unità di misura

  const icons = import.meta.glob('/node_modules/open-weather-icons/src/svg/*.svg', { eager: true });

  // Usiamo sempre Fahrenheit per la linea
  const chartData = useMemo(() => {
    return hourlies
      .map((hour) => {
        const dateObj = new Date(hour.date);
        return {
          time: `${dateObj.getHours().toString().padStart(2, '0')}:00`,
          temperatureF: parseFloat(hour.t), // Salviamo sempre in Fahrenheit
          icon: hour.icon,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [hourlies]);

  const renderIcon = (x, y, index) => {
    const iconCode = chartData[index].icon;
    const iconPath = icons[`/node_modules/open-weather-icons/src/svg/${iconCode}.svg`]?.default;
    return (
      <g>
        <image x={x - 10} y={y - 30} width="20" height="20" href={iconPath} alt="weather-icon" />
      </g>
    );
  };

  // Calcolare i limiti dell'asse Y in Fahrenheit
  const temperatures = chartData.map((data) => data.temperatureF);
  const dataMin = Math.min(...temperatures);
  const dataMax = Math.max(...temperatures);

  // Aggiungere margini per un migliore rendering
  const yPadding = 20;
  const minRange = 15;
  const yDomainMin = Math.min(dataMin - yPadding, dataMin - minRange);
  const yDomainMax = Math.max(dataMax + yPadding, dataMax + minRange);

  return (
    <div className="w-full h-32 mt-4 overflow-x-auto overflow-y-hidden rounded-lg text-center items-center bg-gradient-to-r from-yellow-50 to-indigo-50">
      <div style={{ width: "650px" }}>
        {chartData.length > 0 && (
          <LineChart width={650} height={200} data={chartData} margin={{ right: 20, left: 60, bottom: 75, top: 30 }}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fontWeight: "semibold", fill: "#000000" }}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[yDomainMin, yDomainMax]} hide />
            <Line type="monotone" dataKey="temperatureF" stroke="#000000" strokeWidth={2} dot>
              {/* 🔥 Mostriamo la temperatura convertita senza cambiare i dati del grafico */}
              <LabelList
                dataKey="temperatureF"
                position="top"
                fill="#000000"
                fontSize={14}
                fontWeight="bold"
                content={({ x, y, index }) => (
                  <text x={x + 1} y={y + 20} textAnchor="middle" fill="#000000" fontSize={14} fontWeight="bold">
                    {`${renderTemperature(chartData[index].temperatureF, isCelsius)}°`}
                  </text>
                )}
              />
              <LabelList dataKey="icon" position="bottom" content={({ x, y, index }) => renderIcon(x, y, index)} />
            </Line>
          </LineChart>
        )}
      </div>
    </div>
  );
}

HourlyForecast.propTypes = {
  hourlies: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      t: PropTypes.string.isRequired, // 🔥 Deve essere sempre Fahrenheit nei dati
    })
  ).isRequired,
};

export default HourlyForecast;