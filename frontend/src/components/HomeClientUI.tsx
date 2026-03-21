"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WriteNoteModal from "./WriteNoteModal";
import { FaPenNib } from "react-icons/fa";

export default function HomeClientUI() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="z-50 relative pointer-events-auto">
        {/* Floating Glassmorphism CTA Button */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="cta-float group relative flex items-center justify-center gap-3 px-10 py-4 bg-white/40 hover:bg-white/55 backdrop-blur-lg border border-white/50 text-gray-800 font-semibold rounded-full shadow-[0_8px_32px_rgba(0,80,160,0.15)] transition-all duration-300 ease-in-out hover:shadow-[0_12px_40px_rgba(0,80,160,0.22)] focus:outline-none focus:ring-4 focus:ring-sky-200/50"
          whileHover={{ y: -4, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FaPenNib className="text-sky-600 group-hover:rotate-[20deg] transition-transform duration-300" size={22} />
          <span className="text-lg tracking-wide">Write a Note</span>
          
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none" />
          
          {/* Subtle gradient shimmer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>
      </div>

      {/* The Write Note Overlay */}
      <WriteNoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
