import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MarketList from './pages/MarketList'
import MarketDetail from './pages/MarketDetail'

export default function App(){
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const handleDarkModeChange = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem("darkMode", JSON.stringify(isDark));
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={<MarketList darkMode={darkMode} onDarkModeChange={handleDarkModeChange} />} 
        />
        <Route 
          path="/market/:id" 
          element={<MarketDetail darkMode={darkMode} onDarkModeChange={handleDarkModeChange} />} 
        />
      </Routes>
    </BrowserRouter>
  )
}
