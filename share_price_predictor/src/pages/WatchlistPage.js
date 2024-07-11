import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StockIcon from '@mui/icons-material/ShowChart';
import { UserContext } from '../App';
import {
  Avatar, Box, Card, CardContent, Grid, Snackbar, Typography, Alert, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Button, TextField
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const WatchlistPage = () => {
  const { watchlistId } = useParams();
  const [stocks, setStocks] = useState([]);
  const { currentPrices, lastPrices } = useContext(UserContext);
  const [percentChange, setPercentChange] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [watchlistName, setWatchlistName] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlistStocks = async () => {
      try {
        const response = await fetch(`http://localhost:5247/api/Watchlist/GetWatchlist/${watchlistId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWatchlistName(data.name);
        setNewWatchlistName(data.name);
      } catch (error) {
        console.error("Error setting watchlist name: ", error);
      }
      try {
        const response = await fetch(`http://localhost:5247/api/Watchlist/stocks/${watchlistId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStocks(data.$values);
      } catch (error) {
        console.error('Error fetching watchlist stocks:', error);
      }
    };

    fetchWatchlistStocks();
  }, [watchlistId]);

  const handleCardClick = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const handleRemoveClick = async (e, stock) => {
    e.stopPropagation(); // Prevent card click

    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/deleteStock`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockId: stock.id, watchlistId: Number(watchlistId) })
      });

      if (response.ok) {
        setStocks(prevStocks => prevStocks.filter(s => s.symbol !== stock.symbol));
        setSnackbarMessage({ type: 'success', message: 'Stock removed successfully' });
      } else {
        const errorData = await response.json();
        setSnackbarMessage({ type: 'error', message: errorData.message || 'Failed to remove stock' });
      }
    } catch (error) {
      console.error(`Error removing stock from watchlist:`, error);
      setSnackbarMessage({ type: 'error', message: 'Failed to remove stock' });
    }
  };

  const handleDeleteWatchlist = async () => {
    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/delete/${watchlistId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSnackbarMessage({ type: 'success', message: 'Watchlist deleted successfully' });
        setTimeout(() => navigate('/feed'), 1500); // Redirect to home after showing the snackbar
      } else {
        const errorData = await response.json();
        setSnackbarMessage({ type: 'error', message: errorData.message || 'Failed to delete watchlist' });
      }
    } catch (error) {
      console.error(`Error deleting watchlist:`, error);
      setSnackbarMessage({ type: 'error', message: 'Failed to delete watchlist' });
    }
    setOpenDeleteDialog(false);
  };

  const handleEditWatchlist = async () => {
    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/EditWatchlist`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ WatchlistId: Number(watchlistId), NewName: newWatchlistName })
      });

      if (response.ok) {
        setWatchlistName(newWatchlistName);
        setSnackbarMessage({ type: 'success', message: 'Watchlist renamed successfully' });
      } else {
        const errorData = await response.json();
        setSnackbarMessage({ type: 'error', message: errorData.message || 'Failed to rename watchlist' });
      }
    } catch (error) {
      console.error(`Error renaming watchlist:`, error);
      setSnackbarMessage({ type: 'error', message: 'Failed to rename watchlist' });
    }
    setOpenEditDialog(false);
  };

  useEffect(() => {
    if (stocks.length > 0 && lastPrices.length > 0) {
      const updatedPercentChange = {};

      stocks.forEach((stock) => {
        const foundLastPrice = lastPrices.find(lp => lp.symbol === stock.symbol);
        const lastPrice = foundLastPrice ? foundLastPrice.lastPrice : null;
        const currentPrice = currentPrices[stock.symbol];
        
        if (lastPrice !== null && currentPrice !== undefined) {
          updatedPercentChange[stock.symbol] = (((currentPrice - lastPrice) / lastPrice) * 100).toFixed(2);
        }
      });

      setPercentChange(updatedPercentChange);
    }
  }, [stocks, lastPrices, currentPrices]);


  return (
    <div>
      <br/>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" sx={{ textAlign: 'left', flexGrow: 1,fontFamily:'sans-serif',fontSize:'2vw' }}>
          {watchlistName}
        </Typography>
        <Box>
          <IconButton onClick={() => setOpenDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
          <IconButton onClick={() => setOpenEditDialog(true)}>
            <EditIcon />
          </IconButton>
        </Box>
      </Box>
      <hr/>
      <br />
      {(stocks && stocks.length > 0) ? (
        <Grid container spacing={3}>
          {stocks.map((stock) => (
            <Grid item key={stock.symbol} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{
                  borderRadius: '30px',
                  height: '200px',
                  '&:hover': { backgroundColor: 'grey.300' }
                }}
                onClick={() => handleCardClick(stock.symbol)}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                      <StockIcon />
                    </Avatar>
                    <RemoveIcon sx={{ color: "red", border: "1px solid", borderRadius: '6px', borderColor: "red", '&:hover': { backgroundColor: "red", color: "white" } }}
                      onClick={(e) => handleRemoveClick(e, stock)}
                    />
                  </Box>
                  <Typography variant="h5" component="div">
                    {stock.stockName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {currentPrices[stock.symbol] !== undefined ? `₹${currentPrices[stock.symbol]}` : "Loading..."}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={percentChange[stock.symbol] > 0 ? 'green' : percentChange[stock.symbol] < 0 ? 'red' : 'textSecondary'}
                  >
                    {percentChange[stock.symbol] !== undefined ? `${percentChange[stock.symbol]}%` : "Loading..."}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <h3 style={{ marginTop: "15%", marginLeft:"42%"}}>Watchlist is Empty</h3>
      )}
      {snackbarMessage && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setSnackbarMessage(null)}>
          <Alert onClose={() => setSnackbarMessage(null)} severity={snackbarMessage.type} sx={{ width: '100%' }}>
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
      )}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Watchlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this watchlist? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteWatchlist} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
      >
        <DialogTitle>Edit Watchlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the new name for the watchlist.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Watchlist Name"
            fullWidth
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditWatchlist} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default WatchlistPage;
