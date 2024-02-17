import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import NewProject from './components/NewProject';
import Projects from './components/Projects';
import NewTag from './components/NewTag';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          <Route path="/projects" element={<Projects/>}></Route>
          <Route path="/register" element={<Register/>}></Route>
          <Route path="/newProject" element={<NewProject/>}></Route>
          <Route path="/newTag" element={<NewTag/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
