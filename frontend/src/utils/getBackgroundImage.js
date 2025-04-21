const getBackgroundImage = (iconCode) => {
  const backgrounds = {
     "01d": "/images/bg/clear-day.jpg",
     "01n": "/images/bg/clear-night.jpeg",
     "02d": "/images/bg/partly-cloudy-day.jpg",
     "02n": "/images/bg/partly-cloudy-night.jpg",
     "03d": "/images/bg/cloudy-day.jpg",
     "03n": "/images/bg/cloudy-night.jpg",
     "04d": "/images/bg/overcast-day.jpg",
     "04n": "/images/bg/overcast-night.jpg",
     "09d": "/images/bg/shower-rain-day.jpg",
     "09n": "/images/bg/shower-rain-night.jpg",
     "10d": "/images/bg/rainy-day.jpg",
     "10n": "/images/bg/rainy-night.jpg",
     "11d": "/images/bg/thunderstorm-day.jpg",
     "11n": "/images/bg/thunderstorm-night.jpg",
     "13d": "/images/bg/snowy-day.jpg",
     "13n": "/images/bg/snowy-night.jpg",
     "50d": "/images/bg/foggy-day.jpg",
     "50n": "/images/bg/foggy-night.jpg",
  };

  return backgrounds[iconCode] ||  "/images/bg/default.jpg";
};

export default getBackgroundImage;