import sunny from '../assets/images/sunny.png'
import { useState } from 'react'

// Utilitarios
import { getWeatherInfo } from '../utils/wheaterCode.Js' // Nota: tenha atenção se o '.Js' tem mesmo o 'J' maiúsculo no nome do ficheiro

const WheatherApp = () => {
  // GERENCIAMENTO E CONTROLE DE DADOS E AÇÕES
  // CORREÇÃO: useState devolve um array [], não um objeto {}
  const [data, setData] = useState(null)
  const [location, setLocation] = useState('')

  const getCoordinates = async (cityName) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=pt&format=json`

    const response = await fetch(url)
    const geodata = await response.json()

    // CORREÇÃO: 'lenght' corrigido para 'length'
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
    try {
      // 1. Buscar as Coordenadas
      const coordinates = await getCoordinates(cityName)

      // 2. Pegar a latitude e longitude
      const { latitude, longitude } = coordinates

      // 3. Montar a URL corretamente sem comentários (//) a quebrar a string
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`

      // 4. Buscar Clima
      const response = await fetch(url)
      const weatherData = await response.json()

      // 5. Traduzindo os codigos do weather code para msg amigaveis para o usuario
      const wheatherInfo = getWeatherInfo(
        weatherData.current.weather_code
      )

      console.log('Clima:', weatherData)

      // 6. Salvar os dados obtidos pela API no estado data
      // CORREÇÃO: Utilizar a informação traduzida de wheatherInfo em vez de weatherData.type (que não existe)
      setData({
        ...weatherData.current,
        city: coordinates.name,
        country: coordinates.country,
        wheatherType: wheatherInfo?.type || 'Desconhecido', 
        wheatherDescription: wheatherInfo?.description || 'Sem descrição'
      })

    } catch (error) {
      console.log(error.message)
    }
  }

  // ELEMENTOS QUE SÃO RENDERIZADOS
  return (
    <div className="container">
      <div className="weather-app">
        <div className="search">
          <div className="search-top">
            <i className="fa-solid fa-location-dot"></i>
            <div className="location">
              {data ? data.city : 'Search a city'}
            </div>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter Location"
              value={location}
              onChange={handleInputChanges}
              onKeyDown={handleKeyDown} /* CORREÇÃO: omKeyDown alterado para onKeyDown */
            />
            <i className="fa-solid fa-magnifying-glass" onClick={() => search(location)}></i>
          </div>
        </div>

        {/* Mostraremos os dados reais apenas se o estado 'data' não for null */}
        {data ? (
          <>
            <div className="weather">
              <img src={sunny} alt="Weather icon" />
              <div className="weather-type">{data.wheatherType}</div>
              <div className="temp">{Math.round(data.temperature_2m)}°</div>
            </div>

            <div className="weather-date">
              {/* Uma formatação básica para a data/hora recebida */}
              <p>{new Date(data.time).toLocaleString('pt-PT')}</p>
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
        ) : (
          <div className="weather-placeholder">
            <p>Por favor, pesquise uma cidade para ver o clima.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WheatherApp