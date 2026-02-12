import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './src/components/Layout'
import Home from './src/pages/Home'
import About from './src/pages/About'
import Cocktails from './src/pages/Cocktails'
import Ingredients from './src/pages/Ingredients'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/cocktails" element={<Cocktails />} />
          <Route path="/ingredients" element={<Ingredients />} />
        </Routes>
      </Layout>
    </Router>
  )
}
