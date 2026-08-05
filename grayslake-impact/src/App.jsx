import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import Home from './pages/Home'
import Project from './pages/Project'
import TimelinePage from './pages/Timeline'
import Sources from './pages/Sources'
import MapPage from './pages/Map'
import OpenQuestions from './pages/OpenQuestions'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Residents from './pages/Residents'
import Reporters from './pages/Reporters'
import Actions from './pages/Actions'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:border-blue-200 focus:rounded-lg focus:shadow-glass focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Four topic pages merged into /project; old URLs keep working */}
            <Route path="/project" element={<Project />} />
            <Route path="/tax" element={<Navigate to="/project#tax" replace />} />
            <Route path="/tax-impact" element={<Navigate to="/project#tax" replace />} />
            <Route path="/jobs" element={<Navigate to="/project#jobs" replace />} />
            <Route path="/energy" element={<Navigate to="/project#energy" replace />} />
            <Route path="/schools" element={<Navigate to="/project#schools" replace />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/questions" element={<OpenQuestions />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/documents" element={<Sources />} />
            <Route path="/sources" element={<Navigate to="/documents" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/residents" element={<Residents />} />
            <Route path="/reporters" element={<Reporters />} />
            {/* /officials deleted — it rendered timelineEvents filtered to three
                categories and nothing else. Redirected rather than 404'd. */}
            <Route path="/officials" element={<Navigate to="/timeline" replace />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
