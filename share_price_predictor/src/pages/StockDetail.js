import { LineChart } from '@mui/x-charts';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Tab } from '@mui/material';

const StockDetail = () => {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [range, setRange] = useState('1D'); // Default to 1D range
  const [chartData, setChartData] = useState({ x: [], y: [] });

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch(`http://localhost:5247/api/Stocks/${symbol}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // console.log('Fetched stock data:', data);
        setStock(data);
        if (range === '1D') {
          setChartData(get1DChartData(data.fiveMinData.$values));
        } else if (range === '5D') {
          setChartData(get5DChartData(data.fiveMinData.$values));
        } else if (range === '1M'){
          setChartData(get1MChartData(data.oneDayData.$values));
        } else if(range === '6M'){
          setChartData(get6MChartData(data.oneDayData.$values));
        } else if(range === '1Y'){
          setChartData(get1YChartData(data.oneWeekData.$values));
        } else{
          setChartData(getMaxChartData(data.oneWeekData.$values));
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStock();
  }, [symbol, range]);

  const get1DChartData = (data) => {
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

  const get5DChartData = (data) => {
    // console.log(data);
    const today = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(today.getDate() - 7); // Subtract 7 days to cover 5 working days

    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= fiveDaysAgo && pointDate <= today && pointDate.getDay() !== 0 && pointDate.getDay() !== 6;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  };

  const get1MChartData = (data) => {
    // console.log(data);
    const today  =new Date();
    const onemonthago = new Date();
    onemonthago.setDate(today.getDate()-31);
    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= onemonthago && pointDate <= today && pointDate.getDay() !== 0 && pointDate.getDay() !== 6;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  }

  const get6MChartData = (data) => {
    const today  =new Date();
    const sixmonthsago = new Date();
    sixmonthsago.setDate(today.getDate()-(6*31));
    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= sixmonthsago && pointDate <= today && pointDate.getDay() !== 0 && pointDate.getDay() !== 6;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  }

  const get1YChartData = (data) => {
    const today  =new Date();
    const oneyearago = new Date();
    oneyearago.setDate(today.getDate()-(365));
    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate >= oneyearago && pointDate <= today && pointDate.getDay() !== 0 && pointDate.getDay() !== 6;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  }

  const getMaxChartData = (data) => {
    const filteredData = data.filter(point => {
      const pointDate = new Date(point.timestamp);
      return pointDate.getDay() !== 0 && pointDate.getDay() !== 6;
    });

    const x = filteredData.map(point => new Date(point.timestamp));
    const y = filteredData.map(point => parseFloat(point.price));

    return { x, y };
  }

  const valueFormatter = (time,range) => {
    const date = new Date(time);
    const options = { month: 'short', year: 'numeric', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    const shortMonth = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

    switch (range) {
      case '1D':
        console.log('1d');
        return `${formattedHours}:${minutes} ${ampm}`;
      case '5D':
        console.log('5d');
        return `${hours}:${minutes}\n${day} ${shortMonth}`;
      case '1M':
        console.log('1m');
        return `${day}\n${shortMonth}\n${year}`;
      case '6M':
        console.log('6m');
        return `${day}\n${shortMonth}\n${year}`;
      case '1Y':
        console.log('1y');
        return `${shortMonth}\n${year}`;
      case 'Max':
        console.log('max');
        return `${shortMonth}\n${year}`;
      default:
        return time;
    }
  };

  const handleTabChange = (event, newRange) => {
    setRange(newRange);
  };

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      {stock ? (
        <div>
          <Tabs value={range} onChange={handleTabChange}>
            <Tab value="1D" label="1D" />
            <Tab value="5D" label="5D" />
            <Tab value="1M" label="1M" />
            <Tab value="6M" label="6M" />
            <Tab value="1Y" label="1Y" />
            <Tab value="Max" label="Max" />
          </Tabs>
          {chartData.x.length > 0 && chartData.y.length > 0 ? (
            <LineChart
              height={400} // Set the height of the chart
              xAxis={[{
                data: chartData.x,
                scaleType: 'band',
                valueFormatter: (x,context) =>(context.location=='tick')?valueFormatter(x,range):valueFormatter(x,range),
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
