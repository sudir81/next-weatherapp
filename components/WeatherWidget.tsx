"use client";
import { useState, useEffect } from "react";
import { defaultCity } from "@/lib/data";

type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  wind_speed_10m: number;
  weather_code: number;
};

type DailyWeather = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
};

type WeatherData = {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: CurrentWeather;
  daily: DailyWeather;
};

type Props = {
  mode?: "current" | "forecast" | "details";
};

function weatherDescription(code: number): string {
  switch (code) {
    case 0:
      return "Clear sky";
    case 1:
      return "Mainly clear";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
      return "Fog";
    case 48:
      return "Depositing rime fog";
    case 51:
      return "Light drizzle";
    case 53:
      return "Moderate drizzle";
    case 55:
      return "Dense drizzle";
    case 56:
      return "Light freezing drizzle";
    case 57:
      return "Dense freezing drizzle";
    case 61:
      return "Slight rain";
    case 63:
      return "Moderate rain";
    case 65:
      return "Heavy rain";
    case 66:
      return "Light freezing rain";
    case 67:
      return "Heavy freezing rain";
    case 71:
      return "Slight snow fall";
    case 73:
      return "Moderate snow fall";
    case 75:
      return "Heavy snow fall";
    case 77:
      return "Snow grains";
    case 80:
      return "Slight rain showers";
    case 81:
      return "Moderate rain showers";
    case 82:
      return "Violent rain showers";
    case 85:
      return "Slight snow showers";
    case 86:
      return "Heavy snow showers";
    default:
      return "Unknown weather condition";
  }
}

export default function WeatherWidget({ mode = "current" }: Props) {
  const [searchCity, setSearchCity] = useState<string>(defaultCity);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function getWeatherData(city: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`,
      );

      if (!response.ok) {
        const data: { error?: unknown } = await response.json();
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to fetch weather data",
        );
      }

      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void getWeatherData(defaultCity);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <h1>Weather Dashboard</h1>
      <form
        className="flex gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          const city = searchCity.trim();
          if (!city) {
            setError("Enter a city name.");
            return;
          }
          void getWeatherData(city);
        }}
      >
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : weatherData && !loading ? (
        <div>
          <h2>
            {weatherData.location.name}, {weatherData.location.country}
          </h2>
          {mode === "current" && (
            <div>
              <p>{weatherDescription(weatherData.current.weather_code)}</p>
              <h2>{Math.round(weatherData.current.temperature_2m)}°C</h2>
              <p>
                Feels like:{" "}
                {Math.round(weatherData.current.apparent_temperature)}°C
              </p>
              <p>Humidity: {weatherData.current.relative_humidity_2m}%</p>
              <p>Wind Speed: {weatherData.current.wind_speed_10m} m/s</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
