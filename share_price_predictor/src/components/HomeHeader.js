import React, { useContext, useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import '../css/HomeHeader.css';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { Paper, Popper } from '@mui/material';

const HomeHeader = () => {
  const [selectedButton, setSelectedButton] = useState("Feed");
  const [watchlistLabel, setWatchlistLabel] = useState("Watchlist");
  const watchlists = ["watchlist1", "watchlist2", "watchlist3", "watchlist4"];
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [stocks,setStocks] = useState('');
  const { setLogin } = useContext(UserContext);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:5247/api/Stocks');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchQuery!=='') {
      const filtered = stocks.filter(stock =>
        (stock.stockName.toLowerCase().includes(searchQuery.toLowerCase()) || stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks([]);
    }
  }, [searchQuery, stocks]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
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
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (label) => {
    setWatchlistLabel(label);
    setSelectedButton('Watchlist');
    handleClose();
  };

  const handleProfileMenuItemClick = () => {
    setSelectedButton("Profile");
    handleProfileClose();
  };

  const reset_password = () => {
    handleProfileMenuItemClick();
  };

  const Sign_out = () => {
    handleProfileMenuItemClick();
    localStorage.removeItem('token');
    setLogin(false);
    navigate('/');
  };

  const handleSearchClick = (event) => {
    setSearchAnchorEl(event.currentTarget);
    if (searchQuery) {
      // Trigger filtering if there's a search query
      const filtered = stocks.filter(stock =>
        stock.stockName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStocks(filtered);
    }

  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
    setFilteredStocks([]);
  };

  const handleClickAway = (event) => {
    if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
      handleSearchClose();
    }
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

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#133353" }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            component="div"
            sx={{ fontFamily: "Oswald", fontWeight: 'bold', fontSize: '1.5em',cursor:"pointer" }}
            onClick={handleFeedClick}
          >
            StockMaster
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input ref={searchInputRef} style={{ ...inputFieldStyle, width: '300px', marginRight: '20px' }} placeholder='Search for stocks' onClick={handleSearchClick} value={searchQuery} onChange={handleInputChange} />
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
              {watchlistLabel}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {watchlists.map((label) => (
                <MenuItem key={label} onClick={() => handleMenuItemClick(label)}>
                  {label}
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
      {/* Popper for search suggestions */}
      <Popper
        open={Boolean(searchAnchorEl)}
        anchorEl={searchAnchorEl}
        placement="bottom"
        sx={popperStyle}
      >
        <Paper sx={{ width: searchAnchorEl ? searchAnchorEl.clientWidth : undefined }}>
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock, index) => (
              <MenuItem key={index} onClick={handleSearchClose}>
                {stock.stockName} ({stock.symbol})
              </MenuItem>
            ))
          ) : (
            <MenuItem>No results found</MenuItem>
          )}
        </Paper>
      </Popper>
    </>
  );
};

export default HomeHeader;