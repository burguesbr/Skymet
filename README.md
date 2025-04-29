# 🌤️ Skymet: Your Weather Companion

![Weather App](https://img.shields.io/badge/Weather%20App-Skymet-blue)

Welcome to **Skymet**, a full-stack weather application that delivers real-time and forecasted weather data in an intuitive and user-friendly interface. This project combines powerful backend capabilities with a dynamic frontend, ensuring users receive accurate weather information tailored to their location.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

## Features

- **Real-Time Weather Data**: Get up-to-date weather information for your location.
- **Forecasting**: Access future weather forecasts to plan your activities.
- **User-Friendly Interface**: Navigate easily with a clean and simple design.
- **Advanced Visualization**: View weather data through charts and icons.
- **Dynamic Location Adaptation**: The app adjusts based on user location for personalized results.

## Technologies Used

Skymet is built using a combination of powerful technologies:

- **Backend**: 
  - Django
  - Django REST Framework
  - Python 3
- **Frontend**:
  - React.js
- **APIs**:
  - OpenWeatherMap API
  - IP-API (ipapi)

## Installation

To get started with Skymet, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/burguesbr/Skymet.git
   cd Skymet
   ```

2. **Set up the backend**:
   - Navigate to the backend directory.
   - Install the required packages:
     ```bash
     pip install -r requirements.txt
     ```

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Start the backend server**:
   ```bash
   python manage.py runserver
   ```

5. **Set up the frontend**:
   - Navigate to the frontend directory.
   - Install the required packages:
     ```bash
     npm install
     ```

6. **Start the frontend server**:
   ```bash
   npm start
   ```

7. **Access the application**: Open your browser and go to `http://localhost:3000`.

## Usage

Once you have the application running, you can:

- Enter your location to get real-time weather updates.
- Explore the forecast for the upcoming days.
- View detailed weather information presented through charts and icons.

## Contributing

Contributions are welcome! If you want to help improve Skymet, please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add some feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Links

For the latest releases, visit the [Releases section](https://github.com/burguesbr/Skymet/releases). Here, you can download the latest version of Skymet and execute it to experience the weather like never before.

For more information, check the [Releases section](https://github.com/burguesbr/Skymet/releases).

## Conclusion

Thank you for checking out Skymet! We hope this application helps you stay informed about the weather. Your feedback and contributions are valuable to us. Happy coding!