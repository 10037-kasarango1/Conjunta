// src/App.js
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import HomePage from './HomePage'

function App() {
  return (
    <Router>
      <>
        <Navbar className="navbar-custom">
          <Container>
            <Navbar.Brand>Examen Parcial 2 - PIC</Navbar.Brand>
            <Nav>
              <Nav.Item>Grupo 1</Nav.Item>
            </Nav>
            <Nav>
              <Nav.Item><Link to="/" className="nav-link">Inicio</Link></Nav.Item>
            </Nav>
          </Container>
        </Navbar>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
