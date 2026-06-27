import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { RootState } from '../store';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  DarkMode,
  LightMode,
  ArrowBack,
} from '@mui/icons-material';
import { toggleTheme } from '../store/slices/themeSlice';

const RegisterPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeMode = useAppSelector((state: RootState) => state.theme.mode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Registration states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Register, Step 2: OTP Verify

  // OTP states
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setStep(2);
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      setOtpSuccess('Email verified successfully! Redirecting to login...');
      setOtpError('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (err: any) => {
      setOtpError(err.response?.data?.message || err.message || 'OTP verification failed');
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ username, email, password });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setOtpSuccess('');
    verifyOtpMutation.mutate({ email, otp });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton
          onClick={() => dispatch(toggleTheme(themeMode === 'light' ? 'dark' : 'light'))}
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: 2,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              color: 'white',
            },
          }}
        >
          {themeMode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>
      </Box>

      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 3,
            boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {step === 1 ? (
            // STEP 1: Registration Form
            <Box>
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Create Account
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Join Stock Pilot today
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleRegisterSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  required
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={registerMutation.isPending}
                  sx={{
                    py: 1.75,
                    fontSize: '1rem',
                    mt: 1,
                  }}
                >
                  {registerMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : 'Sign Up'}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      style={{
                        textDecoration: 'none',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      Sign In
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            // STEP 2: OTP Verification Form
            <Box>
              <IconButton onClick={() => setStep(1)} sx={{ mb: 2 }}>
                <ArrowBack />
              </IconButton>

              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Verify Email
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  We've sent a 6-digit OTP code to <strong>{email}</strong>. Please enter it below.
                </Typography>
              </Box>

              {otpError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {otpError}
                </Alert>
              )}

              {otpSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {otpSuccess}
                </Alert>
              )}

              <Box component="form" onSubmit={handleOtpSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="OTP Code"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  variant="outlined"
                  required
                  placeholder="123456"
                  slotProps={{
                    htmlInput: {
                      maxLength: 6,
                      style: { textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5rem' }
                    }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={verifyOtpMutation.isPending}
                  sx={{
                    py: 1.75,
                    fontSize: '1rem',
                    mt: 1,
                  }}
                >
                  {verifyOtpMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : 'Verify Code'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
