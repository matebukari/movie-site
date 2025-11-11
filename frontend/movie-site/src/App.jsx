import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewPage from "./pages/NewPage";
import PopularPage from "./pages/PopularPage";
import SearchPage from "./pages/SearchPage";
import { CountryProvider } from "./context/CountryContext";

function App() {
  return (
    <CountryProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/popular" element={<PopularPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Router>
    </CountryProvider>
  );
}

export default App;
