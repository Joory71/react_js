import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from 'react-bootstrap/Card';
import { css } from "@emotion/react";
import { ScaleLoader } from "react-spinners";
import './Weather.css';


const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Weather = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const urlImg = "https://openweathermap.org/img/wn/";

    const [add, setAdd] = useState('');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
            fetch(url).then(res => res.json()).then(data => setAdd(data.address));
        });
    }, []);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setCity(add.city);
        fetchData();
    }, [add]);

    const fetchData = async () => {
        const APIKEY = "8ba77e856b1563aa404795602d6c9abb";
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${APIKEY}`
            );
            setWeatherData(response.data);
            setLoading(false);
            console.log(response.data);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const handleInputChange = (e) => {
        setCity(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    function groupWeatherDataByDay(data) {
        const groupedData = {};
        data.forEach((item) => {
            const date = item.dt_txt.split(' ')[0];
            if (!groupedData[date]) {
                groupedData[date] = [];
            }
            groupedData[date].push(item);
        });
        return Object.values(groupedData);
    }

    function formatDate(dateStr) {
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        
        const date = new Date(dateStr);
        const dayName = days[date.getDay()];
        const month = date.getMonth() + 1; // Month is zero-based, so add 1
        const day = date.getDate();
        
        const formattedDate = `${dayName} ${day}/${month}`;
        return formattedDate;
      }
      function formatTemperature(temperature) {
        // Parse the temperature and round it to one decimal place
        const roundedTemperature = Math.round(temperature * 10) / 10;
      
        // Convert the rounded temperature to a string with one decimal place
        return roundedTemperature.toFixed(1);
      }
      
    return (
        <Container>
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Enter city name"
                                value={city}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Get Weather
                        </Button>
                    </Form>
                </Col>
            </Row>

            {loading ? (
                // Display an animated loader while loading data
                <Row className='loader'>
                    <Col>
                        <ScaleLoader
                            css={override}
                            size={150}
                            color={"#123abc"} // You can customize the color
                            loading={loading}
                        />
                    </Col>
                </Row>
            ) : weatherData ? (
                // Display weather information when data is available
                <>
                    <Row>
                        <Col>
                            <h2>{weatherData.city.name}</h2>
                        </Col>
                    </Row>
                    {weatherData.list.slice(0, 1).map((firstDayData, index) => (
                        <Row key={index} className='today-weather'>
                            
                                <h3>Aujourd'hui:</h3>
                                {/*<p> {formatDate(firstDayData.dt_txt)}</p>*/}
                                <Col className='col-8'>
                                    <p>Temperature: <strong>{formatTemperature(firstDayData.main.temp)}°C</strong></p>
                                    <p>Description: <strong>{firstDayData.weather[0].description}</strong></p>
                                </Col>
                                <Col className='col-4'><img src={urlImg + firstDayData.weather[0].icon + ".png"} alt="meteo" /></Col>
                            
                        </Row>
                    ))}
                    <Row className='today-weather'>
                        <Col className='col-12'>
                            <h3>Prévision du jour:</h3>
                        </Col>

                        {weatherData.list.slice(1, 4).map((dayData, index) => (

                            <Col className='col-4'>
                                <p> <strong>{formatDate(dayData.dt_txt)}</strong></p>
                                <p>Heure: <strong>{dayData.dt_txt.split(' ')[1].slice(0,-3)}</strong></p>
                                <p>Temperature: <strong>{formatTemperature(dayData.main.temp)}°C</strong></p>
                                <p>Description: <strong>{dayData.weather[0].description}</strong></p>
                                <img src={urlImg + dayData.weather[0].icon + ".png"} alt="meteo" />
                            </Col>

                        ))}
                    </Row>
                    <Row>
                        <Col>
                            <h3>Autres jours</h3>
                        </Col>
                    </Row>
                    <div className="scrollable-cards row">
                        {groupWeatherDataByDay(weatherData.list.slice(5, 40)).map((dayData, index) => {
                            if (index === 0) {
                                // Skip the first day
                                return null;
                            }

                            return (
                                <Card key={index} className='col-12'>
                                    <Card.Body className='row'>
                                        <Card.Title> <strong>{formatDate(dayData[0].dt_txt.split(' ')[0])}</strong></Card.Title>
                                        {dayData.map((hourData, hourIndex) => (
                                            <div key={hourIndex} className='col-3 card-forecast'>
                                                <Card.Text>
                                                    Heure: <strong>{hourData.dt_txt.split(' ')[1].slice(0,-3)}</strong>
                                                </Card.Text>
                                                <Card.Text>
                                                    Temperature: <strong>{formatTemperature(hourData.main.temp)}°C</strong>
                                                </Card.Text>
                                                <Card.Text>
                                                    Description: <strong>{hourData.weather[0].description}</strong>
                                                </Card.Text>
                                                <img
                                                    src={urlImg + hourData.weather[0].icon + ".png"}
                                                    alt="meteo"
                                                />
                                            </div>
                                        ))}
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </div>


                </>
            ) : (
                <Row>
                    <Col>
                        <p>Loading weather data...</p>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Weather;
