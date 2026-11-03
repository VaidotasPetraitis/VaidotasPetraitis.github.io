import { Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router';
import { Portfolio } from '../features/portfolio/Portfolio';

const legacyPaths = new Map([
  ['about', '/'],
  ['experience', '/experience'],
  ['certifications', '/certifications'],
]);

export default function App() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (location.pathname === '/' && searchParams.has('section')) {
    return <Navigate to={legacyPaths.get(searchParams.get('section')!) ?? '/not-found'} replace />;
  }

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
