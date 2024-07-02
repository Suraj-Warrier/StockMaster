import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';

const PrivateRoute = ({ children }) => {
  const { login } = useContext(UserContext);

  return login ? children : <Navigate to="/" />;
};

export default PrivateRoute;
