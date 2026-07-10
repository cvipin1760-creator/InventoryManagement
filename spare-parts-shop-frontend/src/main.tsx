import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { OfflineSyncService } from './utils/offlineSync';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { store, RootState } from './store';
import { initializeTheme } from './store/slices/themeSlice';
import { lightTheme, darkTheme } from './theme';
import { useAppSelector, useAppDispatch } from './store/hooks';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

OfflineSyncService.init();

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeInitializer />
          <ReactQueryDevtools initialIsOpen={false} />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
