import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import Home from './pages/Home'
import Project from './pages/Project'
import Agreement from './pages/Agreement'
import TimelinePage from './pages/Timeline'
import Sources from './pages/Sources'
import MapPage from './pages/Map'
import OpenQuestions from './pages/OpenQuestions'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Accessibility from './pages/Accessibility'
import Privacy from './pages/Privacy'
import Reporters from './pages/Reporters'
import Actions from './pages/Actions'
import Records from './pages/Records'
import RecordsT5 from './pages/RecordsT5'
import RecordsOrdinance from './pages/RecordsOrdinance'
import Press from './pages/Press'
import Updates from './pages/Updates'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-paper flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-paper-raised focus:text-accent focus:border focus:border-accent focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Four topic pages merged into /project; old URLs keep working */}
            <Route path="/project" element={<Project />} />
            <Route path="/agreement" element={<Agreement />} />
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
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* Residents folded into /questions, which now carries its plain-language
                answers behind a toggle. Redirected, not 404'd. */}
            <Route path="/residents" element={<Navigate to="/questions" replace />} />
            <Route path="/figures" element={<Reporters />} />
            <Route path="/reporters" element={<Navigate to="/figures" replace />} />
            {/* /officials deleted — it rendered timelineEvents filtered to three
                categories and nothing else. Redirected rather than 404'd. */}
            <Route path="/officials" element={<Navigate to="/timeline" replace />} />
            <Route path="/actions" element={<Actions />} />
            {/* Public Records. /records/t5 is the flagship page; each ordinance
                gets its own address so a citation can point at one document. */}
            <Route path="/records" element={<Records />} />
            <Route path="/records/t5" element={<RecordsT5 />} />
            <Route path="/records/t5/:ordinance" element={<RecordsOrdinance />} />
            <Route path="/press" element={<Press />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
