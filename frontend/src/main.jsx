import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faStar, faBriefcase, faLocationDot, faDollarSign, faClock, 
  faBuilding, faSearch, faUser, faSignOutAlt, faQuoteLeft, 
  faQuoteRight, faChevronLeft, faChevronRight, faEnvelope,
  faPhone, faCalendarAlt, faCheck
} from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faStar as faStarRegular, faBookmark } from '@fortawesome/free-regular-svg-icons'

// Add all icons to the library
library.add(
  faStar, faStarRegular, faBriefcase, faLocationDot, faDollarSign, 
  faClock, faBuilding, faSearch, faUser, faSignOutAlt, faBookmark,
  faQuoteLeft, faQuoteRight, faChevronLeft, faChevronRight, 
  faLinkedin, faTwitter, faFacebook, faInstagram, faEnvelope,
  faPhone, faCalendarAlt, faCheck
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
