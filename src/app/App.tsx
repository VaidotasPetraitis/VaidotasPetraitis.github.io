import { Route, Routes } from 'react-router';
import { Portfolio } from '../features/portfolio/Portfolio';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio page="about" />} />
      <Route path="/experience" caseSensitive element={<Portfolio page="experience" />} />
      <Route path="/certifications" caseSensitive element={<Portfolio page="certifications" />} />
      <Route path="/projects/:slug" caseSensitive element={<Portfolio page="project" />} />
      <Route path="*" element={<Portfolio page="not-found" />} />
    </Routes>
  );
}
