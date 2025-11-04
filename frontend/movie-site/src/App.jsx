import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewPage from "./pages/NewPage";
import PopularPage from "./pages/PopularPage";
import { CountryProvider } from "./context/CountryContext";

function App() {
  return (
    <CountryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/popular" element={<PopularPage />} />
        </Routes>
      </Router>
    </CountryProvider>
  );
}

export default App;
