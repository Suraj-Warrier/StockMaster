import React, { useContext, useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { Paper, Popper, Tooltip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import ResetPasswordModal from './ResetPasswordModal';
import FilterModal from './FilterModal';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const HomeHeader = () => {
  const [selectedButton, setSelectedButton] = useState("Feed");
  const [watchlistLabel, setWatchlistLabel] = useState("Watchlist");
  const [watchlists, setWatchlists] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [stocks, setStocks] = useState([]);
  const { setLogin, setFeedStocks, login } = useContext(UserContext);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isAddWatchlistModalOpen, setAddWatchlistModalOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:5247/api/Stocks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStocks(data.$values);
        setLogin(localStorage.getItem('uid'));
        setFeedStocks(data.$values);
        console.log("feedstocks: ", data.$values);
      } catch (error) {
        console.error('Error fetching stocks:', error);
        setSnackbarMessage({type:'error',message:'Error fetching stocks'});
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery !== '') {
      const filtered = stocks.filter(stock =>
        (stock.stockName.toLowerCase().includes(searchQuery.toLowerCase()) || stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks([]);
    }
  }, [searchQuery, stocks]);

  const handleMenuClick = async (event) => {
    setAnchorEl(event.currentTarget);
    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/list/${login}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWatchlists(data.$values);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      setSnackbarMessage({type:'error',message:'Error fetching watchlists'});
    }
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const selectProfile = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleFeedClick = () => {
    setSelectedButton("Feed");
    setWatchlistLabel("Watchlist");
    navigate("/feed");
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (watchlist) => {
    setWatchlistLabel(watchlist.name);
    setSelectedButton('Watchlist');
    handleClose();
    navigate(`/watchlist/${watchlist.id}`);
  };

  const handleProfileMenuItemClick = () => {
    setSelectedButton("Profile");
    handleProfileClose();
  };

  const reset_password = () => {
    setResetPasswordModalOpen(true);
    handleProfileMenuItemClick();
  };

  const Sign_out = () => {
    handleProfileMenuItemClick();
    localStorage.removeItem('token');
    setSnackbarMessage({type:'success',message:'logged out successfully'});
    setLogin(false);
    navigate('/');
  };

  const handleSearchClick = (event) => {
    setSearchAnchorEl(event.currentTarget);
    if (searchQuery) {
      const filtered = stocks.filter(stock =>
        stock.stockName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    }
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClose = (symbol) => {
    setSearchAnchorEl(null);
    setFilteredStocks([]);
    navigate(`/stock/${symbol}`);
  };

  const handleClickAway = (event) => {
    if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
      setSearchAnchorEl(null);
      setFilteredStocks([]);
    }
  };

  const handleResetPasswordSubmit = async (currentPassword, newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5247/api/Account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Failed to reset password");
        return;
      }
      setSnackbarMessage({type:'success',message:'Password changed successfully'});
      // alert("Password changed successfully");
      setResetPasswordModalOpen(false);
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred while resetting the password");
    }
  };

  const handleFilterClick = () => {
    setFilterModalOpen(true);
  };

  const handleFilterSubmit = (filters) => {
    console.log(filters);
  };

  const selectedButtonStyle = {
    borderBottom: "solid #5965d1",
    backgroundColor: "inherit",
    marginRight: '1%',
    fontWeight: 'bold',
    color: "#ffffff",
    '&:hover': {
      borderBottom: "solid #5965d1",
      fontWeight: 'bold',
      backgroundColor: "inherit",
      color: "#ffffff"
    }
  };

  const buttonStyle = {
    backgroundColor: 'inherit',
    marginRight: '1%',
    fontWeight: 'bold',
    borderBottom: "solid #133353",
    color: "#e4e4e4",
    '&:hover': {
      borderBottomColor: "#5965d1",
      backgroundColor: "inherit",
      color: "#ffffff"
    }
  };

  const inputFieldStyle = {
    height: '25px',
    backgroundColor: 'white',
    borderRadius: '5px',
    padding: '5px',
  };

  const popperStyle = {
    zIndex: 1300,
    marginTop: '5px'
  };

  useEffect(() => {
    document.addEventListener('click', handleClickAway);
    return () => {
      document.removeEventListener('click', handleClickAway);
    };
  }, []);

  const handleAddWatchlistClick = () => {
    setAddWatchlistModalOpen(true);
    handleClose();
  };

  const handleAddWatchlistClose = () => {
    setAddWatchlistModalOpen(false);
  };

  const handleAddWatchlistSubmit = async () => {
    if (!newWatchlistName.trim()) {
      alert("Watchlist name cannot be empty");
      return;
    }

    if (watchlists.some(watchlist => watchlist.name.toLowerCase() === newWatchlistName.toLowerCase())) {
      alert("Watchlist name already exists");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5247/api/Watchlist/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newWatchlistName, userId: login })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newWatchlist = await response.json();
      setWatchlists([...watchlists, newWatchlist]);
      setSnackbarMessage({type:'success',message:'Watchlist added successfully'});
      setNewWatchlistName('');
      setAddWatchlistModalOpen(false);
    } catch (error) {
      console.error('Error creating watchlist:', error);
      alert('Failed to create watchlist');
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#133353" }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            component="div"
            sx={{ fontFamily: "Oswald", fontWeight: 'bold', fontSize: '1.5em', cursor: "pointer" }}
            onClick={handleFeedClick}
          >
            StockMaster
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input ref={searchInputRef} style={{ ...inputFieldStyle, width: '300px', marginRight: '20px' }} placeholder='Search for stocks' onClick={handleSearchClick} value={searchQuery} onChange={handleInputChange} />
            <FilterAltIcon sx={{ width: '8%', cursor: 'pointer' }} onClick={handleFilterClick} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              sx={selectedButton === 'Feed' ? selectedButtonStyle : buttonStyle}
              onClick={handleFeedClick}
            >
              Feed
            </Button>
            <Button
              sx={selectedButton === 'Watchlist' ? selectedButtonStyle : buttonStyle}
              onClick={handleMenuClick}
            >
              Watchlists
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleAddWatchlistClick}>
                Add Watchlist <AddIcon />
              </MenuItem>
              {watchlists.length > 0 && <Divider />}
              {watchlists.length > 0 && <MenuItem disabled> </MenuItem>}
              {watchlists.map((label) => (
                <MenuItem key={label.id} onClick={() => handleMenuItemClick(label)}>
                  {label.name}
                </MenuItem>
              ))}
            </Menu>
            <Button
              sx={selectedButton === 'Profile' ? selectedButtonStyle : buttonStyle}
              onClick={selectProfile}
            >
              Settings
            </Button>
            <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={handleProfileClose}>
              <MenuItem key="reset password" onClick={reset_password}>Reset Password</MenuItem>
              <MenuItem key="Sign out" onClick={Sign_out}>Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Popper
        open={Boolean(searchAnchorEl)}
        anchorEl={searchAnchorEl}
        placement="bottom"
        sx={popperStyle}
      >
        <Paper sx={{ width: searchAnchorEl ? searchAnchorEl.clientWidth : undefined }}>
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock, index) => (
              <MenuItem key={index} onClick={() => handleSearchClose(stock.symbol)}>
                {stock.stockName} ({stock.symbol})
              </MenuItem>
            ))
          ) : (
            <MenuItem>No results found</MenuItem>
          )}
        </Paper>
      </Popper>
      {selectedStock && (
        <div>
          <h2>Selected Stock Details</h2>
          <p>Stock Name: {selectedStock.stockName}</p>
          <p>Symbol: {selectedStock.symbol}</p>
          <p>Market Cap: {selectedStock.marketCap}</p>
          <p>Average Volume: {selectedStock.avgVol}</p>
          <p>P/E Ratio: {selectedStock.peRatio}</p>
          {/* Display other stock details as needed */}
        </div>
      )}
      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onClose={() => setResetPasswordModalOpen(false)}
        onSubmit={handleResetPasswordSubmit}
      />
      {snackbarMessage && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setSnackbarMessage(null)}>
          <Alert onClose={() => setSnackbarMessage(null)} severity={snackbarMessage.type} sx={{ width: '100%' }}>
            {snackbarMessage.message}
          </Alert>
        </Snackbar>
      )}
      <FilterModal
        open={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        stocks={stocks}
        onSubmit={handleFilterSubmit}
      />
      <Dialog open={isAddWatchlistModalOpen} onClose={handleAddWatchlistClose}>
        <DialogTitle>Add Watchlist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name of the watchlist"
            fullWidth
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddWatchlistClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddWatchlistSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HomeHeader;
