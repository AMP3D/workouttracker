import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DayDetail } from './pages/DayDetail/DayDetail';
import { Home } from './pages/Home/Home';
import { Logs } from './pages/Logs/Logs';

export const App = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route element={<Home />} path="/" />

      <Route element={<DayDetail />} path="/day/:dateId" />

      <Route element={<Logs />} path="/logs" />
    </Routes>
  </BrowserRouter>
);
