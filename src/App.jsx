import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SelfExclusionForm from './pages/SelfExclusionForm';
import FacialVerificationPage from './pages/FacialVerificationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelfExclusionForm />} />
        <Route path="/facial-verification" element={<FacialVerificationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
