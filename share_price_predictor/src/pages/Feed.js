import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  Card, CardContent, Typography, Avatar, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Autocomplete, TextField, Snackbar, Alert
} from '@mui/material';
import StockIcon from '@mui/icons-material/ShowChart';
import AddIcon from '@mui/icons-material/Add';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { GiConsoleController } from 'react-icons/gi';

const Feed = () => {
  const [stocks, setStocks] = useState({});
  const wsRef = useRef(null);
  const retryInterval = useRef(null);
  const { feedStocks, setCurrentPrices, lastPrices, setLastPrices, login } = useContext(UserContext);
  const navigate = useNavigate();
  const [percentChange, setPercentChange] = useState({});
  const [watchlists, setWatchlists] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedWatchlists, setSelectedWatchlists] = useState([]);
  const [snackbarMessages, setSnackbarMessages] = useState([]);

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
        // console.log("new values: ", message.StockPrices);
        setCurrentPrices(message.StockPrices);
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

  const handleCardClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleAddClick = async (stock) => {
    console.log(stock);
    setSelectedStock(stock);
    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/list/${login}`);
      const data = await response.json();
      setWatchlists(data.$values);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    }
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedWatchlists([]);
  };

  const handleAddToWatchlists = async () => {
    const messages = [];

    for (const watchlist of selectedWatchlists) {
      console.log("watchlist: ",watchlist)
      try {
        const response = await fetch(`http://localhost:5247/api/Watchlist/addStock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stockId: selectedStock.id,watchlistId: watchlist.id })
        });

        if (response.ok) {
          messages.push({ watchlist: watchlist.name, message: 'Stock added successfully', type: 'success' });
        } else {
          const errorData = await response.json();
          messages.push({ watchlist: watchlist.name, message: errorData.message || 'Failed to add stock', type: 'error' });
        }
      } catch (error) {
        console.error(`Error adding stock to watchlist ${watchlist.name}:`, error);
        messages.push({ watchlist: watchlist.name, message: 'Failed to add stock', type: 'error' });
      }
    }
    setSnackbarMessages(messages);
    handleModalClose();
  };

  useEffect(() => {
    const getLastPrices = async () => {
      try {
        const response = await fetch('http://localhost:5247/api/Stocks/getLastClose');
        const data = await response.json();
        setLastPrices(data.$values);
        console.log('Last prices:', data);
      } catch (error) {
        console.error('Error fetching last prices:', error);
      }
    };

    getLastPrices();
  }, []);

  useEffect(() => {
    if (lastPrices.length > 0) {
      connectWebSocket();

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
        }
        if (retryInterval.current) {
          clearInterval(retryInterval.current);
        }
      };
    }
  }, [lastPrices]);

  useEffect(() => {
    if (Object.keys(stocks).length > 0 && lastPrices.length > 0) {
      const updatedPercentChange = {};

      lastPrices.forEach((stock) => {
        const lastPrice = stock.lastPrice;
        const currentPrice = stocks[stock.symbol];
        if (lastPrice && currentPrice) {
          updatedPercentChange[stock.symbol] = (((currentPrice - lastPrice) / lastPrice) * 100).toFixed(2);
        }
      });

      setPercentChange(updatedPercentChange);
    }
  }, [stocks, lastPrices]);

  return (
    <div>
      <br />
      <br />
      <Grid container spacing={3}>
        {feedStocks?.map((stock) => (
          <Grid item key={stock.symbol} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                borderRadius: '30px',
                height: '200px',
                '&:hover': { backgroundColor: 'grey.300' }
              }}
              onClick={() => handleCardClick(stock.symbol)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56 }}>
                    <StockIcon />
                  </Avatar>
                  <AddIcon
                    sx={{ color: "green", border: "1px solid", borderRadius: '6px', borderColor: "green", '&:hover': { backgroundColor: "green", color: "white" } }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleAddClick(stock);
                    }}
                  />
                </Box>
                <Typography variant="h5" component="div">
                  {stock.stockName}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {stocks[stock.symbol] !== undefined ? `₹${stocks[stock.symbol]}` : "Loading..."}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={percentChange[stock.symbol] > 0 ? 'green' : percentChange[stock.symbol] < 0 ? 'red' : 'textSecondary'}
                  >
                    {percentChange[stock.symbol] !== undefined ? `${percentChange[stock.symbol]}%` : "Loading..."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Add to Watchlists</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={watchlists}
            getOptionLabel={(option) => option.name}
            onChange={(event, newValue) => setSelectedWatchlists(newValue)}
            renderInput={(params) => (
              <TextField {...params} variant="standard" label="Watchlists" placeholder="Select watchlists" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddToWatchlists} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {snackbarMessages.map((msg, index) => (
        <Snackbar key={index} open={true} autoHideDuration={6000} onClose={() => setSnackbarMessages([])}>
          <Alert onClose={() => setSnackbarMessages([])} severity={msg.type} sx={{ width: '100%' }}>
            {msg.watchlist}: {msg.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default Feed;
