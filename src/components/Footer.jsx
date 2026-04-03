import React from "react";
import { theme } from "../styles/theme";
const { colors } = theme;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = ["Terms & Conditions", "Privacy Policy", "Responsible Gaming", "Contact Us"];

  return (
    <footer className="bg-black text-gray-300 pt-8 md:pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <div>
            <h2 className="text-white text-lg md:text-xl font-bold">
              <span style={{ color: colors.primary }}>MY</span>CHOICE.
            </h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-400">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium, rem.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2 md:mb-3">Start a conversation</h3>
            <p className="text-gray-400 text-sm md:text-base">info@mychoice.nz</p>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold mb-2 md:mb-3">More</h3>
            <ul className="space-y-1 md:space-y-2 text-sm md:text-base">
              {quickLinks.map((link) => (
                <li
                  key={link}
                  className="hover:text-green-400 cursor-pointer transition-colors"
                >
                  {link}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-10 border-t border-gray-700 text-center py-4 text-sm">
          <p>Copyright {currentYear} MyChoice</p>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-green-600 to-green-400" />
    </footer>
  );
};

export default Footer;
