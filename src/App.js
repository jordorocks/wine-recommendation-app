import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Grid,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Link,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8E24AA', // A nice purple color for a wine app
    },
    secondary: {
      main: '#FFC107', // A golden color as an accent
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
});

const API_URL = 'https://keen-malabi-73dd43.netlify.app/.netlify/functions/api/submit';

function App() {
  const [dish, setDish] = useState('');
  const [wineListPhoto, setWineListPhoto] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Swirling the glass for inspiration');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (isLoading) {
      const messages = [
        'Swirling the glass for inspiration',
        'Sniffing out the perfect pairing',
        'Consulting our vintage charts',
        'Decanting our expertise'
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleDishChange = (event) => {
    setDish(event.target.value.trim());
  };

  const handleWineListPhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setWineListPhoto(file);
      setFileName(file.name);
    } else {
      console.log('No file selected');
      setWineListPhoto(null);
      setFileName('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!wineListPhoto || !dish) {
      alert('Please provide both the dish and the wine list photo.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('dish', dish);
    formData.append('wineListPhoto', wineListPhoto);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Parsed API response:', data);

      if (!data.recommendations || !Array.isArray(data.recommendations)) {
        throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
      }

      setRecommendation(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Failed to submit. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setDish('');
    setWineListPhoto(null);
    setRecommendation(null);
    setSubmitted(false);
    setIsLoading(false);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    if (typeof price === 'string') {
      return price.startsWith('$') ? price : `$${price}`;
    }
    return 'Price not available';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <LocalBarIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link color="inherit" onClick={resetForm} style={{ cursor: 'pointer', textDecoration: 'none' }}>
              Somm
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Checking in with our wine guru...
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic' }}>
              {loadingMessage}
            </Typography>
          </Box>
        ) : submitted ? (
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Our Recommendation
              </Typography>
              <Typography paragraph>{recommendation.explanation}</Typography>
              <Typography variant="h6" gutterBottom>
                Recommended Wines:
              </Typography>
              {recommendation && recommendation.recommendations && recommendation.recommendations.map((wine, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {wine.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {formatPrice(wine.price)}
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {wine.pairing}
                  </Typography>
                </Box>
              ))}
              <Typography paragraph sx={{ fontStyle: 'italic' }}>
                {recommendation.conclusion}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                Get Wine Recommendations
              </Typography>
              <Typography paragraph>
                Upload a photo of the wine list and enter your dish, and we'll recommend the best wine to suit your meal.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Wine List Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleWineListPhotoChange}
                    />
                  </Button>
                  {fileName && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {fileName}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Enter your dish"
                    variant="outlined"
                    value={dish}
                    onChange={handleDishChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                    disabled={isLoading || !wineListPhoto || !dish}
                  >
                    {isLoading ? 'Processing...' : 'Get Wine Recommendation'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;