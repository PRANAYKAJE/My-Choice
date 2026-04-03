import React, { useState } from "react";
import { Link } from "react-router-dom";
import { theme } from "../styles/theme";
const { colors } = theme;
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuItems = ["Home", "About Us", "Resources", "FAQs", "Contact Us"];

  const socialIcons = [
    { Icon: FaXTwitter, href: "#" },
    { Icon: FaInstagram, href: "#" },
    { Icon: FaLinkedinIn, href: "#" },
    { Icon: FaFacebookF, href: "#" },
  ];

  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-[70px]">
          <Link to="/" className="text-lg md:text-xl font-bold flex-shrink-0">
            <span style={{ color: colors.primary }}>MY</span>CHOICE.
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-6 lg:gap-8 text-sm">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className="hover:text-green-400 cursor-pointer transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden md:flex gap-2 md:gap-3 ml-auto">
            {socialIcons.map((item, i) => {
              const IconComponent = item.Icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  className="bg-green-500 p-1.5 md:p-2 rounded-full hover:bg-green-600 cursor-pointer transition-colors"
                >
                  <IconComponent size={12} />
                </a>
              );
            })}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <div className="flex gap-2">
              {socialIcons.slice(0, 2).map((item, i) => {
                const IconComponent = item.Icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    className="bg-green-500 p-2 rounded-full hover:bg-green-600 cursor-pointer transition-colors"
                  >
                    <IconComponent size={12} />
                  </a>
                );
              })}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className="block px-4 py-2 hover:bg-green-600 cursor-pointer transition-colors rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
