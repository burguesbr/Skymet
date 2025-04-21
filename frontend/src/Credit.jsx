import './styles.css';

export default function Credit() {
  return (
  <div className="w-full mt-6">
    <div className="flex flex-col items-center justify-center w-screen text-gray-700 p-1">
      <div className="max-w-screen-lg bg-white p-2 rounded-lg ring-4 ring-white ring-opacity-40">
        <p className="text-xs text-center">
          Developed by
          <a href="https://www.github.com/sviluppalice" className="text-pink-500"> sviluppalice</a>.
          Powered by <a href="https://docs.openweather.co.uk/our-initiatives/student-initiative" className="text-pink-500"> OpenWeatherMap API&#39;s student initiative</a> and 
          <a href="https://ip-api.com" className="text-pink-500"> Ip-Api</a>.
        </p>
      </div>
    </div>
  </div>
  );
}