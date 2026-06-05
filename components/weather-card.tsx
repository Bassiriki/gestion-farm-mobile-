'use client'

import { useEffect, useState } from 'react'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Wind,
  Droplets,
  Calendar,
  AlertTriangle,
  Locate,
  Info,
  ChevronRight
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Bamako, Mali coordinates as default
const MALI_DEFAULT_COORDS = { lat: 12.6392, lon: -8.0029, name: 'Bamako, Mali' }

interface WeatherData {
  current: {
    temp: number
    humidity: number
    windSpeed: number
    weatherCode: number
    isDay: boolean
  }
  daily: Array<{
    date: string
    weatherCode: number
    tempMax: number
    tempMin: number
  }>
  locationName: string
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coords, setCoords] = useState(MALI_DEFAULT_COORDS)
  const [isGeo, setIsGeo] = useState(false)

  // Geolocation detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Votre Position'
          })
          setIsGeo(true)
        },
        () => {
          setCoords(MALI_DEFAULT_COORDS)
          setIsGeo(false)
        }
      )
    } else {
      setCoords(MALI_DEFAULT_COORDS)
      setIsGeo(false)
    }
  }, [])

  // Fetch weather data from Open-Meteo
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
        const res = await fetch(url)
        if (!res.ok) throw new Error('Erreur de récupération météo')
        
        const data = await res.json()
        
        const nextDays = data.daily.time.slice(0, 3).map((time: string, index: number) => ({
          date: new Date(time).toLocaleDateString('fr-FR', { weekday: 'short' }),
          weatherCode: data.daily.weather_code[index],
          tempMax: Math.round(data.daily.temperature_2m_max[index]),
          tempMin: Math.round(data.daily.temperature_2m_min[index])
        }))

        setWeather({
          current: {
            temp: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day === 1
          },
          daily: nextDays,
          locationName: coords.name
        })
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Météo indisponible')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [coords])

  const getWeatherDetails = (code: number, isDay: boolean = true) => {
    switch (code) {
      case 0:
        return {
          icon: <Sun className="h-6 w-6 text-amber-400 animate-spin-slow" />,
          modalIcon: <Sun className="h-12 w-12 text-amber-400 animate-spin-slow" />,
          label: 'Ensoleillé',
          bgClass: 'from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20',
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
        }
      case 1:
      case 2:
      case 3:
        return {
          icon: <Cloud className="h-6 w-6 text-slate-400" />,
          modalIcon: <Cloud className="h-12 w-12 text-slate-400" />,
          label: 'Nuageux',
          bgClass: 'from-slate-400/10 to-emerald-600/5 dark:from-slate-950/20 dark:to-emerald-950/10',
          badgeColor: 'bg-slate-400/10 text-slate-600 dark:text-slate-400'
        }
      case 45:
      case 48:
        return {
          icon: <Cloud className="h-6 w-6 text-slate-300" />,
          modalIcon: <Cloud className="h-12 w-12 text-slate-300" />,
          label: 'Brouillard',
          bgClass: 'from-slate-400/10 to-zinc-500/10 dark:from-slate-950/20 dark:to-zinc-950/20',
          badgeColor: 'bg-slate-300/10 text-slate-600 dark:text-slate-400'
        }
      case 51:
      case 53:
      case 55:
        return {
          icon: <CloudDrizzle className="h-6 w-6 text-sky-400" />,
          modalIcon: <CloudDrizzle className="h-12 w-12 text-sky-400" />,
          label: 'Bruine',
          bgClass: 'from-sky-400/10 to-emerald-700/10 dark:from-sky-950/20 dark:to-emerald-950/20',
          badgeColor: 'bg-sky-400/10 text-sky-600 dark:text-sky-400'
        }
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return {
          icon: <CloudRain className="h-6 w-6 text-blue-400" />,
          modalIcon: <CloudRain className="h-12 w-12 text-blue-400" />,
          label: 'Pluie',
          bgClass: 'from-blue-500/10 to-teal-700/10 dark:from-blue-950/25 dark:to-teal-950/20',
          badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        }
      case 95:
      case 96:
      case 99:
        return {
          icon: <CloudLightning className="h-6 w-6 text-yellow-400" />,
          modalIcon: <CloudLightning className="h-12 w-12 text-yellow-400" />,
          label: 'Orageux',
          bgClass: 'from-yellow-500/10 to-red-600/10 dark:from-yellow-950/20 dark:to-red-950/25',
          badgeColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
        }
      default:
        return {
          icon: <Cloud className="h-6 w-6 text-slate-400" />,
          modalIcon: <Cloud className="h-12 w-12 text-slate-400" />,
          label: 'Variable',
          bgClass: 'from-slate-400/10 to-emerald-600/5 dark:from-slate-950/20 dark:to-emerald-950/10',
          badgeColor: 'bg-slate-400/10 text-slate-600 dark:text-slate-400'
        }
    }
  }

  const getAgriTip = (temp: number, code: number, wind: number) => {
    if ([95, 96, 99].includes(code)) {
      return {
        text: 'Risques d\'orages. Mettez le matériel sensible à l\'abri et évitez les champs.',
        type: 'warning'
      }
    }
    if ([61, 63, 65, 80, 81, 82].includes(code)) {
      return {
        text: 'Pluie en cours ou prévue. Évitez l\'arrosage artificiel aujourd\'hui pour économiser l\'eau.',
        type: 'info'
      }
    }
    if (wind > 15) {
      return {
        text: `Vents soutenus (${wind} km/h). Évitez les pulvérisations pour limiter la dérive des produits.`,
        type: 'warning'
      }
    }
    if (temp > 35) {
      return {
        text: `Très fortes chaleurs (${temp}°C). Privilégiez l'irrigation tôt le matin ou tard le soir.`,
        type: 'warning'
      }
    }
    return {
      text: 'Conditions idéales pour l\'entretien, les semis ou la récolte en plein champ.',
      type: 'success'
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs animate-pulse flex justify-between items-center h-12">
        <div className="h-4 bg-muted rounded-md w-1/3"></div>
        <div className="h-6 w-6 bg-muted rounded-full"></div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 p-3 shadow-xs flex items-center gap-2 h-12">
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        <span className="text-xs text-red-600 dark:text-red-400 font-semibold">{error || 'Erreur météo'}</span>
      </div>
    )
  }

  const currentDetails = getWeatherDetails(weather.current.weatherCode, weather.current.isDay)
  const tip = getAgriTip(weather.current.temp, weather.current.weatherCode, weather.current.windSpeed)

  return (
    <Dialog>
      {/* Compact weather card trigger */}
      <DialogTrigger asChild>
        <button className={`w-full h-12 rounded-xl border border-border bg-gradient-to-r ${currentDetails.bgClass} px-4 flex items-center justify-between shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer active:scale-[0.99]`}>
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 rounded-lg bg-background/50 backdrop-blur-xs">
              {currentDetails.icon}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-foreground">{weather.current.temp}°C</span>
              <span className="text-[10px] text-muted-foreground font-semibold">({currentDetails.label})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d4a2d] dark:text-[#4ade80] group">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {weather.locationName}
            </span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </DialogTrigger>

      {/* Detailed Modal/Dialog */}
      <DialogContent className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Locate className={`h-4 w-4 ${isGeo ? 'text-emerald-500' : 'text-slate-400'}`} />
            <DialogTitle className="text-base font-bold text-foreground">
              Météo détaillée : {weather.locationName}
            </DialogTitle>
          </div>
          {!isGeo && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 text-left font-medium">
              Géolocalisation bloquée. Position par défaut (Bamako, Mali).
            </p>
          )}
        </DialogHeader>

        {/* Current Detailed Conditions */}
        <div className="mt-3 flex items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900">
              {currentDetails.modalIcon}
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-foreground">{weather.current.temp}</span>
                <span className="text-xl font-bold text-foreground/80">°C</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                {currentDetails.label}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-foreground/80">
              <Droplets className="h-4 w-4 text-sky-500" />
              <span className="font-bold">{weather.current.humidity}%</span>
              <span className="text-[10px] text-muted-foreground">Humidité</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-xs text-foreground/80">
              <Wind className="h-4 w-4 text-slate-500" />
              <span className="font-bold">{weather.current.windSpeed} km/h</span>
              <span className="text-[10px] text-muted-foreground">Vent</span>
            </div>
          </div>
        </div>

        {/* Agricultural Advice Card */}
        <div className="mt-3 p-3.5 rounded-xl bg-background/80 border border-border/40 flex items-start gap-2.5">
          <Info className={`h-4 w-4 shrink-0 mt-0.5 ${tip.type === 'warning' ? 'text-amber-500' : tip.type === 'info' ? 'text-sky-500' : 'text-emerald-500'}`} />
          <div>
            <span className="text-xs font-bold text-foreground block">Conseil Agricole :</span>
            <p className="text-[11px] font-medium leading-relaxed text-foreground/80 mt-0.5">
              {tip.text}
            </p>
          </div>
        </div>

        {/* 3 Day Forecast */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Prévisions sur 3 jours</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {weather.daily.map((day, idx) => {
              const dayDetails = getWeatherDetails(day.weatherCode)
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 shadow-2xs"
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.date}</span>
                  <div className="my-1.5">
                    {dayDetails.icon}
                  </div>
                  <div className="flex gap-1.5 text-[11px] font-bold mt-0.5">
                    <span className="text-foreground">{day.tempMax}°</span>
                    <span className="text-muted-foreground">{day.tempMin}°</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
