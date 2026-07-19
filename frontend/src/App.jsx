import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import AppRoutes from './routes';
import { ThemeProvider } from './context/ThemeContext';

const App = () => (
  <Provider store={store}>
    <ThemeProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            borderRadius: '12px',
            border: '1px solid #334155',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#F1F5F9' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
        }}
      />
    </ThemeProvider>
  </Provider>
);

export default App;
