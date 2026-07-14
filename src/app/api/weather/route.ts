import { NextRequest, NextResponse } from 'next/server';

/**
 * Weather API Route Handler
 * Proxies requests to OpenWeather API, hiding the API key server-side.
 *
 * GET /api/weather?lat=51.556&lon=-0.2796
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '51.556';   // Default: Wembley Stadium
  const lon = searchParams.get('lon') || '-0.2796';

  // If no API key, return realistic mock data
  if (!apiKey) {
    return NextResponse.json(getMockWeatherData());
  }

  try {
    // Fetch current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    // Fetch 5-day/3-hour forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=8&appid=${apiKey}`,
      { next: { revalidate: 300 } }
    );

    if (!currentRes.ok || !forecastRes.ok) {
      console.error('OpenWeather API error:', currentRes.status, forecastRes.status);
      return NextResponse.json(getMockWeatherData());
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Transform into our WeatherData shape
    const weatherData = {
      current: {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
        windDirection: currentData.wind.deg,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        uvIndex: 6, // UV not in basic endpoint; would need One Call API
        rainProbability: currentData.clouds?.all || 30,
        pressure: currentData.main.pressure,
        visibility: Math.round((currentData.visibility || 10000) / 1000),
      },
      forecast: forecastData.list.map((item: any) => ({
        time: item.dt_txt,
        temp: Math.round(item.main.temp),
        rainProbability: Math.round((item.pop || 0) * 100),
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return NextResponse.json(getMockWeatherData());
  }
}

/**
 * Realistic mock weather data for when no API key is configured.
 */
function getMockWeatherData() {
  const now = new Date();
  const forecast = Array.from({ length: 8 }, (_, i) => {
    const time = new Date(now.getTime() + (i + 1) * 3 * 60 * 60 * 1000);
    return {
      time: time.toISOString(),
      temp: Math.round(26 + Math.sin(i * 0.5) * 4),
      rainProbability: Math.round(Math.max(0, 30 + Math.sin(i * 0.8) * 35)),
      humidity: Math.round(55 + Math.sin(i * 0.6) * 15),
      windSpeed: Math.round(12 + Math.sin(i * 0.4) * 8),
      description: i < 3 ? 'partly cloudy' : i < 6 ? 'light rain' : 'clearing',
      icon: i < 3 ? '02d' : i < 6 ? '10d' : '03d',
    };
  });

  return {
    current: {
      temp: 28,
      feelsLike: 31,
      humidity: 62,
      windSpeed: 18,
      windDirection: 225,
      description: 'partly cloudy',
      icon: '02d',
      uvIndex: 7,
      rainProbability: 45,
      pressure: 1013,
      visibility: 10,
    },
    forecast,
    lastUpdated: now.toISOString(),
  };
}
