import { useEffect, useState } from "react";

interface WeatherData {
  suhu: number;
  kode: number;
}

// Mapping kode cuaca WMO (standar yang dipakai Open-Meteo) ke emoji + label sederhana
function interpretWeatherCode(code: number): { icon: string; label: string } {
  if (code === 0) return { icon: "☀️", label: "Cerah" };
  if (code <= 3) return { icon: "⛅", label: "Berawan" };
  if (code <= 48) return { icon: "🌫️", label: "Berkabut" };
  if (code <= 57) return { icon: "🌦️", label: "Gerimis" };
  if (code <= 67) return { icon: "🌧️", label: "Hujan" };
  if (code <= 77) return { icon: "🌨️", label: "Salju" };
  if (code <= 82) return { icon: "🌧️", label: "Hujan Deras" };
  if (code <= 99) return { icon: "⛈️", label: "Badai Petir" };
  return { icon: "🌤️", label: "Cerah Berawan" };
}

export default function WeatherBadge() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "denied" | "error"
  >("loading");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
          );
          const data = await res.json();
          setWeather({
            suhu: Math.round(data.current_weather.temperature),
            kode: data.current_weather.weathercode,
          });
          setStatus("ready");
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("denied"), // user tolak izin lokasi
      { timeout: 8000 },
    );
  }, []);

  if (status === "loading")
    return <span className="text-xs text-gray-400">Memuat cuaca...</span>;
  if (status === "denied" || status === "error" || !weather) return null; // diam saja, tidak ganggu UI kalau gagal

  const { icon, label } = interpretWeatherCode(weather.kode);

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
      {icon} {weather.suhu}°C, {label}
    </span>
  );
}
