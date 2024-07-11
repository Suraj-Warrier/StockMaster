import React, { useContext, useState } from 'react';
import stock_img from "../res/stock_market.png"
import { Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
    // const [pass_tog, setPass_tog] = useState(false)
    const [pass, setPass] = useState("")
    const [email, setEmail] = useState("")

    // State for validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {setLogin}  = useContext(UserContext);

  const navigate  = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();

    // Validate input fields
    let valid = true;
    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!pass) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }

    // If all fields are valid, proceed with login logic
    if (valid) {
      // Your login logic here
      try {
        const response = await fetch('http://localhost:5247/api/Account/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: pass
            })
        });

        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            // Store token in localStorage or session storage
            localStorage.setItem('token', token);
            // Navigate to authenticated page or set login state
            console.log('Login successful');
            const uid = data.userId;
            setLogin(uid);
            navigate('/feed');
        } else {
            // Handle login error
            console.error('Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
      
    }
  };
  const handleSignUpClick = () =>{
    navigate('/register');
  }

  return (
    <Grid container direction="row" justifyContent="center" spacing={3} alignItems="stretch" >
      {/* Left Section - Picture */}
      <Grid item xs={12} md={6}>
      <img src={stock_img} alt="stock img" style={{ maxWidth: '100%',maxHeight:'100%', borderRadius: '25px' }} />

      </Grid>

      {/* Right Section - Login Form */}
      <Grid item xs={12} md={6} style={{textAlign:'center'}}>
        <Paper style={{ padding: '20px', borderRadius:'25px',boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}>
        <Typography variant="h4" gutterBottom style={{margin:"3% auto 11%", fontFamily:"Oswald", fontWeight:"bold" }}>
            StockMaster
          </Typography>

          <Typography variant="h6" gutterBottom style={{margin:"0 auto 5%", fontFamily:"Montserrat"}}>
            Sign In
          </Typography>
          <div>
          <TextField label="Email" fullWidth={false} error={!!emailError} helperText={emailError} margin="normal" style={{width:'50%', margin:'3% auto'}} onChange={(e)=>setEmail(e.target.value)}/>
          </div>
          <div>
          <TextField label="Password" fullWidth={false} error={!!passwordError} helperText={passwordError} margin="normal" type="password" style={{width:'50%', margin:'3% auto 20%'}} onChange={(e)=>setPass(e.target.value)}/>
          </div>

          {/* Password Visibility Toggle Button */}
          {/* You can implement this functionality using a IconButton */}

          <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px', width: '20%', margin: '0 auto 7%' }} onClick={handleSubmit}>
              Sign In
          </Button>
          <hr></hr>
          <Typography variant="body2" style={{ marginTop: '20px', textAlign: 'center' }}>
            Do not have an account? <Link onClick={handleSignUpClick} style={{ cursor: 'pointer'}}>Sign Up</Link>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default SignIn;
