import React, { useEffect, useState, useRef, useContext } from 'react';
import { Card, CardContent, Typography, Avatar, Grid } from '@mui/material';
import StockIcon from '@mui/icons-material/ShowChart'; // Default stock icon
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const [stocks, setStocks] = useState({});
  const wsRef = useRef(null);
  const retryInterval = useRef(null);
  const { feedStocks, setFeedStocks } = useContext(UserContext);
  const navigate = useNavigate();

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:5247/stocks');

    const connectionTimeout = setTimeout(() => {
      if (wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket connection timed out');
        wsRef.current.close();
      }
    }, 5000); // 5 seconds timeout

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      clearTimeout(connectionTimeout);
      if (retryInterval.current) {
        clearInterval(retryInterval.current);
        retryInterval.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.Type === 'stockUpdate') {
        setStocks(message.StockPrices);
        console.log('Stock prices:', message.StockPrices);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket connection closed', event);
      retryConnection();
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      wsRef.current.close();
    };
  };

  const retryConnection = () => {
    if (!retryInterval.current) {
      retryInterval.current = setInterval(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket();
      }, 5000); // Retry every 5 seconds
    }
  };

  const handleCardClick = (symbol) =>{
    navigate(`/stock/${symbol}`);
  }

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (retryInterval.current) {
        clearInterval(retryInterval.current);
      }
    };
  }, []);

  return (
    <div>
      <br />
      <br />
      <Grid container spacing={3}>
        {feedStocks.map((stock) => (
          <Grid item key={stock.symbol} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{height:'200px'}} onClick={()=> handleCardClick(stock.symbol)}>
              <CardContent>
                <Avatar>
                  <StockIcon />
                </Avatar>
                <Typography variant="h5" component="div">
                  {stock.stockName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {stocks[stock.symbol] !== undefined ? stocks[stock.symbol] : "Loading..."}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Feed;
