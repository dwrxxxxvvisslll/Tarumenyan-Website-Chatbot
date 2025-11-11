import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Gallery from "./pages/Gallery"
import Pricelist from "./pages/Pricelist"
import Review from "./pages/Review"
import FAQ from "./pages/FAQ"
import AboutUs from "./pages/AboutUs"
import Chatbot from "./pages/Chatbot"
import Login from "./pages/Login"
import Register from "./pages/Register"
import { AuthProvider } from "./context/AuthContext"
import { DataProvider } from "./context/DataContext"
import ProtectedRoute from "./components/ProtectedRoute"

// Import komponen admin dari folder admin-panel
import ReviewManager from "./pages/admin-panel/ReviewManager"
import FAQManager from "./pages/admin-panel/FAQManager"
import PricelistManager from "./pages/admin-panel/PricelistManager"
import GalleryManager from "./pages/admin-panel/GalleryManager"
import Dashboard from "./pages/admin-panel/Dashboard"
import AdminLayout from "./pages/admin-panel/AdminLayout"

// Import komponen admin baru
import AdminDashboardNew from "./pages/admin/AdminDashboardNew"
import AdminGalleryNew from "./pages/admin/AdminGalleryNew"
import AdminReviewNew from "./pages/admin/AdminReviewNew"
import AdminFAQNew from "./pages/admin/AdminFAQNew"
import AdminPricelistNew from "./pages/admin/AdminPricelistNew"

// Import komponen user
import UserLayout from "./pages/User/UserLayout"
import UserDashboard from "./pages/User/Dashboard"
import UserProfile from "./pages/User/Profile"


import "./App.css"

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminGalleryNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pricelist"
              element={
                <ProtectedRoute>
                  <AdminPricelistNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faq"
              element={
                <ProtectedRoute>
                  <AdminFAQNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/review"
              element={
                <ProtectedRoute>
                  <AdminReviewNew />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="profile" element={<UserProfile />} />
              {/* Tambahkan rute user lainnya di sini */}
            </Route>

            {/* Public Routes */}
            <Route
              path="/"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Home />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/gallery"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Gallery />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/pricelist"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Pricelist />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/review"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Review />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/faq"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <FAQ />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/about-us"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <AboutUs />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/chat"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Chatbot />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/login"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Login />
                  </main>
                  <Footer />
                </div>
              }
            />

            <Route
              path="/register"
              element={
                <div className="app">
                  <Navbar />
                  <main>
                    <Register />
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
