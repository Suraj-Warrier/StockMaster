import { LineChart } from '@mui/x-charts';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`http://localhost:5247/api/Stocks/${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched stock data:', data);
        setStock(data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStock();
  }, [symbol]);

  const getChartData = (data) => {
    if (!Array.isArray(data)) {
      console.error('Expected array for chart data but got:', data);
      return { x: [], y: [] };
    }

    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; // Get the YYYY-MM-DD part of today's date

    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp).toISOString().split('T')[0];
      return pointDate === todayDateString;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  };

  const formatISTTime = (date) => {
    // Convert the date to IST (Indian Standard Time)
    const istDate = new Date(date.getTime());
    return istDate.toTimeString().split(' ')[0].substring(0, 5); // Format to 'HH:MM'
  };

  const chartData = stock && stock.fiveMinData ? getChartData(stock.fiveMinData) : { x: [], y: [] };
  console.log('Chart data:', chartData);

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      {stock ? (
        <div>
          {chartData.x.length > 0 && chartData.y.length > 0 ? (
            <LineChart
              height={400} // Set the height of the chart
              xAxis={[{
                data: chartData.x.map(date => formatISTTime(date)), // Format to IST
                scaleType: 'band', // Use 'band' for categorical data
              }]}
              series={[
                {
                  data: chartData.y,
                },
              ]}
              grid={{ vertical: true, horizontal: true }}
            />
          ) : (
            <p>No chart data available</p>
          )}
          <h2>Stock Details for {stock.stockName}</h2>
          <p>Symbol: {stock.symbol}</p>
          <p>Market Cap: {stock.marketCap}</p>
          <p>Average Volume: {stock.avgVol}</p>
          <p>P/E Ratio: {stock.peRatio}</p>
          {/* Add more stock details here */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default StockDetail;
