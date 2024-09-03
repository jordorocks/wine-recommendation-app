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

function App() {
  const [dish, setDish] = useState('');
  const [wineListPhoto, setWineListPhoto] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Swirling the glass for inspiration');

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
    setDish(event.target.value);
  };

  const handleWineListPhotoChange = (event) => {
    setWineListPhoto(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (wineListPhoto && dish) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('dish', dish);
      formData.append('wineListPhoto', wineListPhoto);

      try {
        const response = await fetch('/.netlify/functions/index', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, details: ${errorData.details}`);
        }

        const data = await response.json();
        console.log('Raw API response:', JSON.stringify(data, null, 2));
        setRecommendation(data);
        setSubmitted(true);
      } catch (error) {
        console.error('Submission failed:', error);
        alert(`Failed to submit. Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please provide both the dish and the wine list photo.');
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
    if (typeof price === 'string') {
      // Add dollar sign if it's missing
      return price.startsWith('$') ? price : `$${price}`;
    }
    return price;
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
              {recommendation.recommendations.map((wine, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {wine.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {formatPrice(wine.price)}
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {wine.description}
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
                  >
                    Get Wine Recommendation
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