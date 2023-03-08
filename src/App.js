import { Container } from '@mui/system';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <Header />
      <Container maxWidth="lg" sx={{display : "flex", flexDirection : "column", justifyContent : "center", marginTop : "40px", alignItems : "center"}} fixed disableGutters>
        <Home />
      </Container>
    </div>
  );
}

export default App;
