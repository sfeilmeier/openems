import { addIcons } from "ionicons";
import { environment } from "src/environments";

export enum WeatherIcon {
    ClearDay = "oe-clear-day",
    ClearNight = "oe-clear-night",
    PartlyCloudyDay = "oe-partly-cloudy-day",
    PartlyCloudyNight = "oe-partly-cloudy-night",
    Thunderstorm = "oe-thunderstorm",
    WeatherCloudy = "oe-weather-cloudy",
    WeatherFoggy = "oe-weather-foggy",
    WeatherMix = "oe-weather-mix",
    WeatherRainy = "oe-weather-rainy",
    WeatherSnowy = "oe-weather-snowy",
    Unknown = "oe-help",
}

export function registerWeatherIcons(): void {
    addIcons({
        "oe-clear-day": environment.icons.WEATHER.CLEAR_DAY,
        "oe-clear-night": environment.icons.WEATHER.CLEAR_NIGHT,
        "oe-partly-cloudy-day": environment.icons.WEATHER.PARTLY_CLOUDY_DAY,
        "oe-partly-cloudy-night": environment.icons.WEATHER.PARTLY_CLOUDY_NIGHT,
        "oe-thunderstorm": environment.icons.WEATHER.THUNDERSTORM,
        "oe-weather-cloudy": environment.icons.WEATHER.WEATHER_CLOUDY,
        "oe-weather-foggy": environment.icons.WEATHER.WEATHER_FOGGY,
        "oe-weather-mix": environment.icons.WEATHER.WEATHER_MIX,
        "oe-weather-rainy": environment.icons.WEATHER.WEATHER_RAINY,
        "oe-weather-snowy": environment.icons.WEATHER.WEATHER_SNOWY,
        "oe-sunshine-duration": environment.icons.WEATHER.SUNSHINE_DURATION,
        "oe-help": environment.icons.WEATHER.HELP,
    });
}
