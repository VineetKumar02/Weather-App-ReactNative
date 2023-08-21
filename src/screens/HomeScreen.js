import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'

import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import * as Location from 'expo-location';

import { weatherImages } from '../constants';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { getData, storeData } from '../utils/asyncStorage';



// Actual Code for Homescreen Component
export default function HomeScreen() {

    // State variables
    const [showSearch, toggleSearch] = useState(false);  // Whether to show the search input
    const [locations, setLocations] = useState([]);      // Array to store the list of locations
    const [loading, setLoading] = useState(true);        // Whether data is still loading
    const [weather, setWeather] = useState({});          // Object to store the weather data

    // To run at start up of the app
    useEffect(() => {
        fetchOldWeatherData();
    }, []);



    // To fetch the weather data at start up
    const fetchOldWeatherData = async () => {

        setLoading(true);
        let myCity = await getData('city');

        // If user has already searched for a location. Show weather data of that place
        if (myCity) {
            cityName = myCity;

            fetchWeatherForecast({
                cityName,
                days: '7'
            }).then(data => {
                // console.log("Weather Data: ", JSON.stringify(data, undefined, 4));
                setWeather(data);
                setLoading(false);
            })
        }
        // Otherwise fetch Show weather data of current location
        else {
            fetchMyWeatherData();
        }
    }

    // To fetch the weather data for current location
    const fetchMyWeatherData = async () => {

        // Get permission for location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            // If not granted show error
            console.error('Permission to access location was denied');
            return;
        }

        // Get current coordinates and send to api call to fetch data
        setLoading(true);
        let locationObj = await Location.getCurrentPositionAsync({});
        let cityName = locationObj.coords.latitude + "," + locationObj.coords.longitude;

        fetchWeatherForecast({
            cityName,
        }).then(data => {
            // console.log("Weather Data: ", JSON.stringify(data, undefined, 4));
            setWeather(data);
            setLoading(false);
            toggleSearch(false);
        })
    }


    // To handle the search request and show place suggestions
    const handleSearch = (search) => {
        if (search && search.length > 2)
            fetchLocations({ cityName: search }).then(data => {
                setLocations(data);
                // console.log("Locations: ", JSON.stringify(data, undefined, 4));
            })
    }

    // To get the wetaher details for selected location
    const handleLocation = (loc) => {
        setLoading(true);
        toggleSearch(false);
        setLocations([]);

        fetchWeatherForecast({
            cityName: loc.name,
            days: 7,
        }).then(data => {
            // console.log("Weather Data: ", JSON.stringify(data, undefined, 4));
            setLoading(false);
            setWeather(data);
            storeData('city', loc.name);
        })
    }

    // To send request to API after 1.2 secs of finish typing (To prevent lot of calls to API)
    const handleTextDebounce = (search) => {
        setTimeout(() => {
            handleSearch(search);
        }, 1200);
    };

    // Store the data got from the API
    const { location, current } = weather;


    return (
        // To bring input fields above keyboard and make screen scrollable
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}    // To take full screen space
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardShouldPersistTaps="handled"

        >
            <View className="flex-1 min-h-screen">

                {/* Status bar with translucent set to false by default. To prevent movement when keyboard appears */}
                <StatusBar
                    backgroundColor="#04232e"
                    barStyle={"light-content"}
                />
                {/* Background image */}
                <Image
                    blurRadius={5}
                    source={require('../assets/images/bg.png')}
                    className="absolute w-full h-full"
                />
                {/* Main page content */}
                {
                    loading ? (
                        <View className="flex-1 flex-row justify-center items-center">
                            <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
                        </View>
                    ) : (
                        <SafeAreaView className="flex flex-1 py-5 ">

                            {/* search section */}
                            <View style={{ height: '7%' }} className="mx-4 z-50">
                                <View
                                    className="flex-row justify-between items-center rounded-full"
                                    style={{ backgroundColor: showSearch ? 'rgba(255,255,255, 0.2)' : 'transparent' }}>

                                    {/* Get cuurent Location Icon */}
                                    <TouchableOpacity
                                        onPress={() => fetchMyWeatherData()}
                                        className="rounded-full p-3 m-1"
                                        style={{ backgroundColor: 'rgba(255,255,255, 0.3)' }}>
                                        <MapPinIcon size="25" color="white" />
                                    </TouchableOpacity>

                                    {
                                        // Show Text Input when the search icon is clicked
                                        showSearch ? (
                                            <TextInput
                                                onChangeText={handleTextDebounce}
                                                placeholder="Search city"
                                                placeholderTextColor={'lightgray'}
                                                className="pl-3 h-10 pb-1 flex-1 text-base text-white"
                                            />
                                        ) : null
                                    }

                                    {/* Search button icon */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            toggleSearch(!showSearch)
                                            if (!showSearch)
                                                setLocations([]);
                                        }}
                                        className="rounded-full p-3 m-1"
                                        style={{ backgroundColor: 'rgba(255,255,255, 0.3)' }}>
                                        {
                                            showSearch ? (
                                                <XMarkIcon size="25" color="white" />
                                            ) : (
                                                <MagnifyingGlassIcon size="25" color="white" />
                                            )
                                        }
                                    </TouchableOpacity>

                                    {/* To show the suggested locations when user types*/}
                                </View>
                                {
                                    locations.length > 0 && showSearch ? (
                                        <View className="absolute w-full bg-gray-300 top-16 rounded-3xl ">
                                            {
                                                // Use map to iterate all locations and show them
                                                locations.map((loc, index) => {
                                                    // Show rounded border only for last location element
                                                    let showBorder = index + 1 != locations.length;
                                                    let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                                                    return (
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => handleLocation(loc)}
                                                            className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}>
                                                            <MapPinIcon size="20" color="gray" />
                                                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc.state ? loc.state + ', ' : ''}{loc?.country}</Text>
                                                        </TouchableOpacity>
                                                    )
                                                })
                                            }
                                        </View>
                                    ) : null
                                }
                            </View>


                            {/* forecast section */}
                            <View className="mx-4 flex justify-around flex-1 mb-2">

                                {/* location */}
                                <Text className="text-white text-center text-2xl font-bold">
                                    {location?.name},
                                    <Text className="text-lg font-semibold text-gray-300">
                                        {" " + location?.country}
                                    </Text>
                                </Text>

                                {/* weather icon */}
                                <View className="flex-row justify-center">
                                    <Image
                                        // source={{uri: 'https:'+current?.condition?.icon}} 
                                        source={weatherImages[current?.condition?.text || 'other']}
                                        className="w-52 h-52" />
                                </View>

                                {/* degree celcius */}
                                <View className="space-y-2">
                                    <Text className="text-center font-bold text-white text-6xl ml-5">
                                        {current?.temp_c}&#176;C
                                    </Text>
                                    <Text className="text-center text-white text-xl tracking-widest">
                                        {current?.condition?.text}
                                    </Text>
                                </View>


                                {/* other stats */}
                                <View className="flex-row justify-between mx-4">
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/wind.png')} className="w-6 h-6" />
                                        <Text className="text-white font-semibold text-base">{current?.wind_kph} km/h</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
                                        <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/pressure.png')} className="w-7 h-7" />
                                        <Text className="text-white font-semibold text-base">{current?.pressure_in} in</Text>
                                    </View>

                                </View>
                            </View>


                            {/* forecast for next days */}
                            <View className="mb-2 space-y-3">
                                <View className="flex-row items-center mx-5 space-x-2">
                                    <CalendarDaysIcon size="22" color="white" />
                                    <Text className="text-white text-base">Daily forecast</Text>
                                </View>

                                <ScrollView
                                    horizontal
                                    contentContainerStyle={{ paddingHorizontal: 15 }}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    {
                                        // To map to get data for forecast data
                                        weather?.forecast?.forecastday?.map((item, index) => {
                                            const date = new Date(item.date);
                                            const options = { weekday: 'long' };
                                            let dayName = date.toLocaleDateString('en-US', options);
                                            dayName = dayName.split(',')[0];

                                            return (
                                                <View
                                                    key={index}
                                                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                                    style={{ backgroundColor: 'rgba(255,255,255, 0.15)', borderColor: 'gray', borderWidth: 1 }}
                                                >
                                                    <Image
                                                        // source={{uri: 'https:'+item?.day?.condition?.icon}}
                                                        source={weatherImages[item?.day?.condition?.text || 'other']}
                                                        className="w-11 h-11" />
                                                    <Text className="text-white">{dayName}</Text>
                                                    <Text className="text-white text-xl font-semibold">
                                                        {item?.day?.avgtemp_c}&#176;c
                                                    </Text>
                                                </View>
                                            )
                                        })
                                    }
                                </ScrollView>

                            </View>

                        </SafeAreaView>
                    )
                }
            </View >
        </KeyboardAwareScrollView>
    )
}
