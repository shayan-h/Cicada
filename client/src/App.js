import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/home" element={<Dashboard/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App;
