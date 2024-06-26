import React, { useEffect, useState, useRef } from 'react';

const Feed = () => {
  const [stocks, setStocks] = useState({});
  const wsRef = useRef(null);
  const retryInterval = useRef(null);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:5247/stocks');

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      if (retryInterval.current) {
        clearInterval(retryInterval.current);
        retryInterval.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.Type === 'stockUpdate') {
        setStocks(message.StockPrices);
        console.log('stock prices is:', message.StockPrices);
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
      <h1>Stock Prices</h1>
      <div>
        {Object.keys(stocks).map((symbol) => (
          <div key={symbol}>
            <p>{symbol}: {stocks[symbol]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
