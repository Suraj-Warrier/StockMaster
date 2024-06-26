import React, { useContext, useState } from 'react';
import stock_img from "../res/stock_market.png"
import { Button, Grid, Link, Paper, TextField, Typography } from '@mui/material';
import { UserContext } from '../App';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    // const [pass_tog, setPass_tog] = useState(false)
    const [pass, setPass] = useState("")
    const [email, setEmail] = useState("")
    const [confirmPass, setConfirmPass] = useState("")

    // State for validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError,setConfirmPasswordError] = useState('');

  const {setLogin}  = useContext(UserContext);

  const navigate = useNavigate();

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
      if (!confirmPass){
        setConfirmPasswordError('Confirm your password');
        valid =false;
      }
      else if(pass !== confirmPass){
        setConfirmPasswordError('Passwords not matching');
        valid = false;
      }
      else{
        setConfirmPasswordError('');
      }
  
      // If all fields are valid, proceed with login logic
      if (valid) {
        // Your login logic here
        try {
          const response = await fetch('http://localhost:5247/api/Account/register', {
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
              // Registration successful
              console.log('User registered successfully');
              // TODO: include message to check for verification email
          } else {
              // Handle registration error
              console.error('Registration failed');
          }
      } catch (error) {
          console.error('Error registering user:', error);
      }
        
      }
    };

    const handleSignInClick  = () =>{
      navigate('/');
    }

  return (
    <Grid container direction="row" justifyContent="center" spacing={3} alignItems="stretch" >
      {/* Left Section - Picture */}
      <Grid item xs={12} md={6}>
      <img src={stock_img} alt="stock img" style={{ maxWidth: '100%',maxHeight:'100%', borderRadius: '25px' }} />

      </Grid>

      {/* Right Section - Login Form */}
      <Grid item xs={12} md={6} style={{textAlign:'center'}}>
        <Paper style={{ padding: '20px', borderRadius:'25px', boxShadow:'0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'}}>
          <Typography variant="h4" gutterBottom style={{margin:"3% auto 11%", fontFamily:"Oswald", fontWeight:"bold" }}>
            StockMaster
          </Typography>

          <Typography variant="h6" gutterBottom style={{margin:"0 auto 3%"}}>
            Sign Up
          </Typography>
          <div>
          <TextField label="Email" fullWidth={false} error={!!emailError} helperText={emailError} margin="normal" style={{width:'50%', margin:'3% auto'}} onChange={(e)=>setEmail(e.target.value)}/>
          </div>
          <div>
          <TextField label="Password" fullWidth={false} error={!!passwordError} helperText={passwordError} margin="normal" type="password" style={{width:'50%', margin:'3% auto'}} onChange={(e)=>setPass(e.target.value)}/>
          </div>
          <div>
          <TextField label=" Confirm Password" fullWidth={false} error={!!confirmPasswordError} helperText={confirmPasswordError} margin="normal" type="password" style={{width:'50%', margin:'3% auto 9%'}} onChange={(e)=>setConfirmPass(e.target.value)}/>
          </div>

          {/* Password Visibility Toggle Button */}
          {/* You can implement this functionality using a IconButton */}

          <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px', width: '20%', margin: '0 auto 5%' }} onClick={handleSubmit}>
              Sign Up
          </Button>
          <hr></hr>

          <Typography variant="body2" style={{ marginTop: '20px', textAlign: 'center' }}>
            Already have an account? <Link onClick={handleSignInClick} style={{ cursor: 'pointer'}}>Sign In</Link>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default SignUp;
