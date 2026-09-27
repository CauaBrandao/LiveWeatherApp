import { useState } from 'react'

// Images
import sunny from '../assets/images/sunny.png'
import cloudy from '../assets/images/cloudy.png'
import rainy from '../assets/images/rainy.png'
import snowy from '../assets/images/snowy.png'
import loading from '../assets/images/loading.gif'

// Utilitarios
import { getWeatherInfo } from '../utils/wheaterCode.Js'

// Mapeamento de tipo de clima para imagem
const weatherImages = {
  sunny: sunny,
  cloudy: cloudy,
  rainy: rainy,
  snowy: snowy
}

const WheatherApp = () => {
  // GERENCIAMENTO E CONTROLE DE DADOS E AÇÕES
  const [data, setData] = useState(null)
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCoordinates = async (cityName) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt&format=json`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Erro ao conectar com o serviço de geocoding')
    }

    const geodata = await response.json()

    if (!geodata.results || geodata.results.length === 0) {
      throw new Error('Cidade não encontrada')
    }

    const city = geodata.results[0]

    return {
      latitude: city.latitude,
      longitude: city.longitude,
      name: city.name,
      country: city.country
    }
  }

  const handleInputChanges = (e) => {
    setLocation(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      search(location)
    }
  }

  const search = async (cityName) => {
    if (!cityName.trim()) {
      setError('Por favor, digite o nome de uma cidade')
      return
    }

    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      // 1. Buscar as Coordenadas
      const coordinates = await getCoordinates(cityName)

      // 2. Pegar a latitude e longitude
      const { latitude, longitude } = coordinates

      // 3. Montar a URL da API de previsão
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`

      // 4. Buscar Clima
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do clima')
      }

      const weatherData = await response.json()

      // 5. Traduzindo os codigos do weather code para msg amigaveis para o usuario
      const wheatherInfo = getWeatherInfo(
        weatherData.current.weather_code
      )

      console.log('Clima:', weatherData)

      // 6. Salvar os dados obtidos pela API no estado data
      setData({
        ...weatherData.current,
        city: coordinates.name,
        country: coordinates.country,
        wheatherType: wheatherInfo?.type || 'Desconhecido',
        wheatherDescription: wheatherInfo?.description || 'Sem descrição'
      })

    } catch (err) {
      console.error(err.message)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Determinar a imagem correta com base no tipo de clima
  const getWeatherImage = () => {
    if (!data) return sunny
    return weatherImages[data.wheatherType] || sunny
  }

  const isColdOrRainy = data && (data.temperature_2m <= 15 || data.wheatherType === 'rainy' || data.wheatherType === 'snowy')
  const bgClass = isColdOrRainy ? 'cold-rainy-bg' : 'default-bg'

  // ELEMENTOS QUE SÃO RENDERIZADOS
  return (
    <div className={`container ${bgClass}`}>
      <div className={`weather-app ${bgClass}`}>
        <div className="search">
          <div className="search-top">
            <i className="fa-solid fa-location-dot"></i>
            <div className="location">
              {data ? `${data.city}, ${data.country}` : 'Search a city'}
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={handleInputChanges}
              onKeyDown={handleKeyDown}
            />
            <i className="fa-solid fa-magnifying-glass" onClick={() => search(location)}></i>
          </div>
        </div>

        {/* Estado de Loading */}
        {isLoading && (
          <div className="loading">
            <img src={loading} alt="Carregando..." className="loader" />
          </div>
        )}

        {/* Estado de Erro */}
        {error && !isLoading && (
          <div className="not-found">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p>{error}</p>
          </div>
        )}

        {/* Mostraremos os dados reais apenas se o estado 'data' não for null */}
        {data && !isLoading && (
          <>
            <div className="weather">
              <img src={getWeatherImage()} alt={data.wheatherDescription} />
              <div className="weather-type">{data.wheatherType}</div>
              <div className="weather-description">{data.wheatherDescription}</div>
              <div className="temp">{Math.round(data.temperature_2m)}°</div>
            </div>

            <div className="weather-date">
              <p>{new Date(data.time).toLocaleString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div className="weather-data">
              <div className="humidity">
                <div className="data-name">Humidity</div>
                <i className="fa-solid fa-droplet"></i>
                <div className="data">{data.relative_humidity_2m}%</div>
              </div>

              <div className="wind">
                <div className="data-name">Wind</div>
                <i className="fa-solid fa-wind"></i>
                <div className="data">{data.wind_speed_10m} km/h</div>
              </div>
            </div>
          </>
        )}

        {/* Placeholder inicial */}
        {!data && !isLoading && !error && (
          <div className="weather-placeholder">
            <img src={sunny} alt="Weather" style={{ opacity: 0.5, marginTop: '3rem' }} />
            <p>Pesquise uma cidade para ver o clima.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WheatherApp