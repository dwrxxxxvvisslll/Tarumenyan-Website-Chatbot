import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import PublicLayout from "./components/PublicLayout"
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

// Import komponen admin
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminGallery from "./pages/admin/AdminGallery"
import AdminReview from "./pages/admin/AdminReview"
import AdminFAQ from "./pages/admin/AdminFAQ"
import AdminPricelist from "./pages/admin/AdminPricelist"

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
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pricelist"
              element={
                <ProtectedRoute>
                  <AdminPricelist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faq"
              element={
                <ProtectedRoute>
                  <AdminFAQ />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/review"
              element={
                <ProtectedRoute>
                  <AdminReview />
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
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
            <Route path="/pricelist" element={<PublicLayout><Pricelist /></PublicLayout>} />
            <Route path="/review" element={<PublicLayout><Review /></PublicLayout>} />
            <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
            <Route path="/about-us" element={<PublicLayout><AboutUs /></PublicLayout>} />
            <Route path="/chat" element={<PublicLayout><Chatbot /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  )
}

export default App
