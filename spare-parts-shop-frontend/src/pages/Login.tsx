import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useMutation } from '@tanstack/react-query';
import { authApi, LoginCredentials, LoginResponse } from '../api/authApi';
import type { RootState } from '../store';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
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
} from '@mui/icons-material';
import { toggleTheme } from '../store/slices/themeSlice';

const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeMode = useAppSelector((state: RootState) => state.theme.mode);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: LoginResponse) => {
      dispatch(setCredentials({
        user: {
          id: data.userId,
          username: data.username,
          role: data.role as any,
          businessId: data.businessId,
        },
        features: data.features,
      }));
      navigate(from, { replace: true });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Check for saved credentials
  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      const { username, password } = JSON.parse(savedUser);
      setFormData({ username, password });
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = () => {
    const newState = !rememberMe;
    setRememberMe(newState);

    if (newState) {
      localStorage.setItem('rememberedUser', JSON.stringify(formData));
    } else {
      localStorage.removeItem('rememberedUser');
    }
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

      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 4,
            alignItems: 'center',
            minHeight: '80vh',
          }}
        >
          {/* Left Side - Illustration/Welcome */}
          {!isMobile && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                pr: 4,
              }}
            >
              <Box
                component="img"
                src="/stockpilot_logo.png"
                alt="StockPilot Logo"
                sx={{
                  width: 240,
                  height: 'auto',
                  mb: 4,
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Welcome Back!
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                Streamline your inventory, billing, and customer management with Stock Pilot.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { label: 'Multi-Tenant' },
                  { label: 'Modern UI' },
                  { label: 'Real-time Sync' },
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Right Side - Login Form */}
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 3 : 5,
              borderRadius: 3,
              boxShadow: '0 20px 60px -10px rgba(0,0,0,0.15)',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Sign In
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your credentials to continue
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                required
                autoComplete="username"
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                required
                autoComplete="current-password"
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                    />
                  }
                  label="Remember Me"
                />

                <Link
                  to="/forgot-password"
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loginMutation.isPending}
                sx={{
                  py: 1.75,
                  fontSize: '1rem',
                  mt: 1,
                }}
              >
                {loginMutation.isPending ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : 'Sign In'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  >
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
