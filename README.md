# Weather App (React Native)

Welcome to the Weather App! This mobile application allows users to effortlessly check real-time weather conditions for any location, providing accurate forecasts and essential weather information. With an intuitive user interface and dynamic features, it's a handy tool for staying ahead of the weather.

## Preview

![Weather App](https://drive.google.com/uc?id=1N09omcrwTZG5T5LlFGePH3il6dHeLVXU)

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## Introduction

The Weather App is a mobile application built using React Native and Expo. It provides users with up-to-date weather information for any location, making it easy to plan their activities based on the weather conditions.


## Features

- Real-time weather updates for any location.
- Location-based weather forecasts for the current day and the next few days.
- User-friendly and beautifully designed interface.
- Integration with the WeatherAPI to provide accurate and reliable weather data.

## Getting Started

Follow these steps to set up and run the Weather App on your mobile device:

### Prerequisites

Make sure you have the following software and tools installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/VineetKumar02/Weather-App-ReactNative.git
    ```

2. Navigate to the project folder:

    ```bash
    cd Weather-App-ReactNative
    ```

3. Install project dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

4. Go to [WeatherAPI](https://www.weatherapi.com), create an account, and get an API key.

5. Open the `constants/index.js` file in your project and replace `YOUR_API_KEY` with the API key you obtained from WeatherAPI:

    ```javascript
    export const API_KEY = 'YOUR_API_KEY';
    ```

### Running the App

Now that you have all the dependencies installed and the API key set up, you can run the Weather App on your mobile device using Expo:

1. Start the development server:

    ```bash
    npm start
    # or
    yarn start
    ```

2. Use the Expo Go app on your iOS or Android device to scan the QR code displayed in the terminal.

3. The Weather App will open on your mobile device, and you can start checking real-time weather conditions.

    **NOTE:-** Both devices should be connected to the same wifi network.

## Usage

- Enter the name of a location or allow the app to access your device's location.
- View the current weather, including temperature, conditions, and wind speed.
- Check the weather forecast for the next few days to plan your activities.

## Technologies Used

The Weather App is built with the following technologies and tools:

- React Native
- Expo
- WeatherAPI for weather data

## Contributing
Contributions to this project are welcome! Feel free to open issues and submit pull requests for any enhancements or fixes.

---
💙 If you like this project, give it a ⭐ and share it with friends!
