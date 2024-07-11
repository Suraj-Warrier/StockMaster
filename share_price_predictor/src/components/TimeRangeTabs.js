import React from 'react';
import { Tabs, Tab } from '@mui/material';

const TimeRangeTabs = ({ value, onChange }) => {
  return (
    <Tabs value={value} onChange={(event, newValue) => onChange(newValue)} centered>
      <Tab label="1D" value="1D" />
      <Tab label="5D" value="5D" />
      <Tab label="1M" value="1M" />
      <Tab label="6M" value="6M" />
      <Tab label="1Y" value="1Y" />
      <Tab label="Max" value="Max" />
    </Tabs>
  );
};

export default TimeRangeTabs;
