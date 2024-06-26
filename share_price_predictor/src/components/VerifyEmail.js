import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [message, setMessage] = useState('');
  const { search } = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(search);
  const email = queryParams.get('email');
  const token = queryParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      const response = await fetch('http://localhost:5247/api/Account/verifyEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (response.ok) {
        setMessage('Email verified successfully. You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage('Error verifying email.');
      }
    };

    if (email && token) {
      verifyEmail();
    }
  }, [email, token, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;
