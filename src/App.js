import { Container } from '@mui/system';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import {toast, ToastContainer} from 'react-toastify';
 
// Import toastify css file
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <Header />
      <Container maxWidth="lg" sx={{display : "flex", flexDirection : "column", justifyContent : "center", marginTop : "40px", alignItems : "center"}} fixed disableGutters>
        <Home />
      </Container>
    </div>
  );
}

export default App;
