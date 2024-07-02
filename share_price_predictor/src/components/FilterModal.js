import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Switch, FormControlLabel, MenuItem, Button, FormControl, FormHelperText } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

const holdingPeriodOptions = ["1 hour", "3 hours", "1 day", "2 days", "4 days", "1 week", "2 weeks", "1 month"];

const FilterModal = ({ open, onClose, stocks, onSubmit }) => {
  const [openPosition, setOpenPosition] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [stockName, setStockName] = useState('');
  const [positionType, setPositionType] = useState('long');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [holdingPeriodMin, setHoldingPeriodMin] = useState('');
  const [holdingPeriodMax, setHoldingPeriodMax] = useState('');
  const [long, setLong] = useState(false);
  const [short, setShort] = useState(false);
  const [predictionStrengthMin, setPredictionStrengthMin] = useState('');
  const [predictionStrengthMax, setPredictionStrengthMax] = useState('');

  const handleFormSubmit = () => {
    if (openPosition) {
      if (!entryPrice || !stockName) {
        alert('Entry price and stock name must not be empty');
        return;
      }
    } else {
      if (!priceMin && !priceMax && !holdingPeriodMin && !holdingPeriodMax && !long && !short && !predictionStrengthMin && !predictionStrengthMax) {
        alert('At least one of the criteria (price, holding period, position type or prediction strength) must not be empty');
        return;
      }
    }

    const filters = {
      openPosition,
      entryPrice,
      stockName,
      positionType,
      priceMin,
      priceMax,
      holdingPeriodMin,
      holdingPeriodMax,
      long,
      short,
      predictionStrengthMin,
      predictionStrengthMax
    };

    onSubmit(filters);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        width: '80%', 
        bgcolor: 'background.paper', 
        boxShadow: 24, 
        p: 4 
      }}>
        <Typography variant="h6" component="h2">
          Filter Stocks
        </Typography>
        <FormControlLabel
          control={
            <Switch checked={openPosition} onChange={() => setOpenPosition(!openPosition)} />
          }
          label="Open Position"
          sx={{ display: 'block', margin: '20px 0' }}
        />
        {openPosition ? (
          <>
            <TextField
              label="Entry Price"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              type="number"
              sx={{ width: '100%', mb: 2 }}
            />
            <Autocomplete
              options={stocks.map(stock => stock.stockName)}
              value={stockName}
              onChange={(e, newValue) => setStockName(newValue)}
              renderInput={(params) => <TextField {...params} label="Stock Name" />}
              sx={{ width: '100%', mb: 2 }}
            />
            <FormControl component="fieldset" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography>Position Type:</Typography>
              <FormControlLabel
                control={
                  <Switch checked={positionType === 'long'} onChange={() => setPositionType(positionType === 'long' ? 'short' : 'long')} />
                }
                label={positionType}
              />
            </FormControl>
          </>
        ) : (
          <>
            <FormControl sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ mr: 2 }}>Price:</Typography>
              <TextField
                label="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                type="number"
                sx={{ width: '45%' }}
              />
              <TextField
                label="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                type="number"
                sx={{ width: '45%' }}
              />
            </FormControl>
            <FormControl sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ mr: 2 }}>Holding Period:</Typography>
              <TextField
                select
                label="Min"
                value={holdingPeriodMin}
                onChange={(e) => setHoldingPeriodMin(e.target.value)}
                sx={{ width: '45%' }}
              >
                {holdingPeriodOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Max"
                value={holdingPeriodMax}
                onChange={(e) => setHoldingPeriodMax(e.target.value)}
                sx={{ width: '45%' }}
              >
                {holdingPeriodOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl component="fieldset" sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography>Position Type:</Typography>
              <FormControlLabel
                control={
                  <Switch checked={long} onChange={() => setLong(!long)} />
                }
                label="Long"
              />
              <FormControlLabel
                control={
                  <Switch checked={short} onChange={() => setShort(!short)} />
                }
                label="Short"
              />
            </FormControl>
            <FormControl sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ mr: 2 }}>Prediction Strength:</Typography>
              <TextField
                label="Min"
                value={predictionStrengthMin}
                onChange={(e) => setPredictionStrengthMin(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                sx={{ width: '45%' }}
              />
              <TextField
                label="Max"
                value={predictionStrengthMax}
                onChange={(e) => setPredictionStrengthMax(e.target.value)}
                type="number"
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                sx={{ width: '45%' }}
              />
            </FormControl>
          </>
        )}
        <Button variant="contained" color="primary" onClick={handleFormSubmit} sx={{ mt: 2 }}>
          Apply Filters
        </Button>
      </Box>
    </Modal>
  );
};

export default FilterModal;
