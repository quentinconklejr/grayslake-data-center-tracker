import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/layout/ScrollToTop'
import Home from './pages/Home'
import TaxImpact from './pages/TaxImpact'
import Jobs from './pages/Jobs'
import Energy from './pages/Energy'
import Schools from './pages/Schools'
import TimelinePage from './pages/Timeline'
import Sources from './pages/Sources'
import MapPage from './pages/Map'
import OpenQuestions from './pages/OpenQuestions'
import NotFound from './pages/NotFound'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tax-impact" element={<TaxImpact />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/energy" element={<Energy />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/questions" element={<OpenQuestions />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
