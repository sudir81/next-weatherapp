import { NextRequest, NextResponse } from "next/server";

type Location = {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type GeocodingResponse = {
  results?: Location[];
};

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
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  weather_code: number[];
};

type HourlyWeather = {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  precipitation: number[];
  wind_speed_10m: number[];
};

type ForecastResponse = {
  current?: CurrentWeather;
  daily?: DailyWeather;
  hourly?: HourlyWeather;
};

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim() || "Dallas";
  if (city.length > 100) {
    return NextResponse.json({ error: "Invalid city name" }, { status: 400 });
  }

  try {
    const geocodingURL = new URL(
      "https://geocoding-api.open-meteo.com/v1/search",
    );
    geocodingURL.searchParams.set("name", city);
    geocodingURL.searchParams.set("count", "1");
    geocodingURL.searchParams.set("language", "en");
    geocodingURL.searchParams.set("format", "json");

    const geocodingResponse = await fetch(geocodingURL, {
      next: { revalidate: 3600 },
    });
    if (!geocodingResponse.ok) {
      console.error("Geocoding service returned an error", geocodingResponse.status);
      return NextResponse.json(
        { error: "Location service is currently unavailable" },
        { status: 502 },
      );
    }

    const geocodingData: GeocodingResponse = await geocodingResponse.json();
    const location = geocodingData.results?.[0];
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const weatherURL = new URL("https://api.open-meteo.com/v1/forecast");
    weatherURL.searchParams.set("latitude", String(location.latitude));
    weatherURL.searchParams.set("longitude", String(location.longitude));
    weatherURL.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "wind_speed_10m",
        "weather_code",
      ].join(","),
    );
    weatherURL.searchParams.set(
      "daily",
      [
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "weather_code",
      ].join(","),
    );
    weatherURL.searchParams.set(
      "hourly",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "wind_speed_10m",
      ].join(","),
    );
    weatherURL.searchParams.set("wind_speed_unit", "ms");
    weatherURL.searchParams.set("timezone", "auto");
    weatherURL.searchParams.set("forecast_days", "7");

    const weatherResponse = await fetch(weatherURL, {
      next: { revalidate: 600 },
    });
    if (!weatherResponse.ok) {
      console.error("Weather service returned an error", weatherResponse.status);
      return NextResponse.json(
        { error: "Weather service is currently unavailable" },
        { status: 502 },
      );
    }

    const weatherData: ForecastResponse = await weatherResponse.json();
    if (!weatherData.current || !weatherData.daily || !weatherData.hourly) {
      console.error("Weather service returned incomplete forecast data");
      return NextResponse.json(
        { error: "Weather service returned incomplete data" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      location: {
        name: location.name,
        country: location.country ?? "",
        latitude: location.latitude,
        longitude: location.longitude,
      },
      current: weatherData.current,
      daily: weatherData.daily,
      hourly: weatherData.hourly,
    });
  } catch (error) {
    console.error("Failed to fetch weather data from upstream services", error);
    return NextResponse.json(
      { error: "Weather service is currently unavailable" },
      { status: 502 },
    );
  }
}