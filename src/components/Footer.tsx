import { motion } from "framer-motion";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-accent" />
              <a href="tel:+256789572007" className="hover:text-accent transition-colors">
                +256 789 572 007
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-accent" />
              <a href="mailto:info@flamia.store" className="hover:text-accent transition-colors">
                info@flamia.store
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-accent" />
              <span>Kampala, Uganda</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/refill" className="hover:text-accent transition-colors">Gas Refill</Link>
              </li>
              <li>
                <Link to="/accessories" className="hover:text-accent transition-colors">Accessories</Link>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <ul className="space-y-2">
              <li>Monday - Friday: 7:30 AM - 10:00 PM</li>
              <li>Saturday: 8:00 AM - 9:00 PM</li>
              <li>Sunday: 9:00 AM - 9:00 PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex flex-col items-center justify-center space-y-4">
            <motion.img initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5
          }} src="/lovable-uploads/c2791a2b-59d6-4982-8cda-b78cbc2556b3.png" alt="Dots Logo" className="w-12 h-12" />
            <div className="text-center">
              <p className="text-sm text-gray-400">© 2025 Flamia. All rights reserved.</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center">
                Designed by Dots 
                <ExternalLink className="w-3 h-3 ml-1" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;