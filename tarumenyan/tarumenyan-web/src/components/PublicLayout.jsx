import Navbar from "./Navbar"
import Footer from "./Footer"

function PublicLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export default PublicLayout
