import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import { debounce } from "lodash";

import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'

import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '../theme';
import { weatherImages } from '../constants';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { getData, storeData } from '../utils/asyncStorage';

import * as Progress from 'react-native-progress';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import * as Location from 'expo-location';




export default function HomeScreen() {

    // State variables
    const [showSearch, toggleSearch] = useState(false); // Whether to show the search input
    const [locations, setLocations] = useState([]);      // Array to store the list of locations
    const [loading, setLoading] = useState(true);        // Whether data is still loading
    const [weather, setWeather] = useState({});          // Object to store the weather data

    
    useEffect(() => {
        fetchOldWeatherData();
    }, []);


    const handleSearch = (search) => {
        // console.log('value: ',search);
        if (search && search.length > 2)
            fetchLocations({ cityName: search }).then(data => {
                // console.log('got locations: ',data);
                setLocations(data);
            })
    }

    const handleLocation = (loc) => {
        setLoading(true);
        toggleSearch(false);
        setLocations([]);

        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setLoading(false);
            setWeather(data);
            storeData('city', loc.name);
        })
    }

    const fetchOldWeatherData = async () => {

        setLoading(true);
        let myCity = await getData('city');

        if (myCity) {
            cityName = myCity;

            fetchWeatherForecast({
                cityName,
                days: '7'
            }).then(data => {
                setWeather(data);
                setLoading(false);
            })
        }
        else {
            fetchMyWeatherData();
        }

    }


    const fetchMyWeatherData = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.error('Permission to access location was denied');
            return;
        }

        setLoading(true);
        let locationObj = await Location.getCurrentPositionAsync({});
        // console.log(locationObj);
        let cityName = locationObj.coords.latitude + "," + locationObj.coords.longitude;

        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
            toggleSearch(false);
        })
    }


    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
    const { location, current } = weather;

    
    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardShouldPersistTaps="handled"

        >
            <View className="flex-1  min-h-screen">
                <StatusBar
                    style="light"
                    translucent={false}
                    backgroundColor='#04232e'
                />
                <Image
                    blurRadius={5}
                    source={require('../assets/images/bg.png')}
                    className="absolute w-full h-full"
                />
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
                                    style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>

                                    <TouchableOpacity
                                        onPress={() => fetchMyWeatherData()}
                                        className="rounded-full p-3 m-1"
                                        style={{ backgroundColor: theme.bgWhite(0.3) }}>
                                        <MapPinIcon size="25" color="white" />
                                    </TouchableOpacity>

                                    {
                                        showSearch ? (
                                            <TextInput
                                                onChangeText={handleTextDebounce}
                                                placeholder="Search city"
                                                placeholderTextColor={'lightgray'}
                                                className="pl-3 h-10 pb-1 flex-1 text-base text-white"
                                            />
                                        ) : null
                                    }
                                    <TouchableOpacity
                                        onPress={() => toggleSearch(!showSearch)}
                                        className="rounded-full p-3 m-1"
                                        style={{ backgroundColor: theme.bgWhite(0.3) }}>
                                        {
                                            showSearch ? (
                                                <XMarkIcon size="25" color="white" />
                                            ) : (
                                                <MagnifyingGlassIcon size="25" color="white" />
                                            )
                                        }

                                    </TouchableOpacity>
                                </View>
                                {
                                    locations.length > 0 && showSearch ? (
                                        <View className="absolute w-full bg-gray-300 top-16 rounded-3xl ">
                                            {
                                                locations.map((loc, index) => {
                                                    let showBorder = index + 1 != locations.length;
                                                    let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : '';
                                                    return (
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => handleLocation(loc)}
                                                            className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}>
                                                            <MapPinIcon size="20" color="gray" />
                                                            <Text className="text-black text-lg ml-2">{loc?.name}, {loc?.country}</Text>
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
                                        {current?.temp_c}&#176;
                                    </Text>
                                    <Text className="text-center text-white text-xl tracking-widest">
                                        {current?.condition?.text}
                                    </Text>
                                </View>

                                {/* other stats */}
                                <View className="flex-row justify-between mx-4">
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/wind.png')} className="w-6 h-6" />
                                        <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/drop.png')} className="w-6 h-6" />
                                        <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <Image source={require('../assets/icons/pressure.png')} className="w-7 h-7" />
                                        <Text className="text-white font-semibold text-base">
                                            {current?.pressure_in}
                                        </Text>
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
                                        weather?.forecast?.forecastday?.map((item, index) => {
                                            const date = new Date(item.date);
                                            const options = { weekday: 'long' };
                                            let dayName = date.toLocaleDateString('en-US', options);
                                            dayName = dayName.split(',')[0];

                                            return (
                                                <View
                                                    key={index}
                                                    className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                                                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                                                >
                                                    <Image
                                                        // source={{uri: 'https:'+item?.day?.condition?.icon}}
                                                        source={weatherImages[item?.day?.condition?.text || 'other']}
                                                        className="w-11 h-11" />
                                                    <Text className="text-white">{dayName}</Text>
                                                    <Text className="text-white text-xl font-semibold">
                                                        {item?.day?.avgtemp_c}&#176;
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
