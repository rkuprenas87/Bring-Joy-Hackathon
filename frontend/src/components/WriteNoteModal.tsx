"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaStickyNote, FaCheck } from "react-icons/fa";
import PaperPlaneIcon from "./PaperPlaneIcon";
import { CgScrollH } from "react-icons/cg";
import type { NoteData, NoteType } from "../app/actions";

interface WriteNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WriteNoteModal({ isOpen, onClose }: WriteNoteModalProps) {
  const [text, setText] = useState("");
  const [selectedType, setSelectedType] = useState<NoteType>("sticky");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("text", text);
    formData.append("type", selectedType);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Failed to send note");
      }

      const payload = (await response.json().catch(() => ({}))) as { success?: boolean; note?: NoteData };
      if (payload.note && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("note:created", { detail: payload.note }));
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setText("");
        setSelectedType("sticky");
        setImageFile(null);
        setShowSuccess(false);
        onClose();
      }, 1200);
    } catch (error) {
      console.error("Error submitting note:", error);
      alert("Uh oh, the vacuum ate your note! Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/25 backdrop-blur-md transition-opacity"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-white/75 backdrop-blur-2xl border border-white/60 sm:rounded-3xl rounded-2xl p-8 shadow-[0_24px_80px_rgba(0,80,160,0.15)] transform"
          >
            {/* Success Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <FaCheck size={28} className="text-white" />
                  </motion.div>
                  <p className="text-lg font-semibold text-gray-700">Sent into the sky!</p>
                  <p className="text-sm text-gray-400">Your note is floating away ☁️</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 text-gray-400 hover:text-gray-700 hover:bg-white/60 rounded-full transition-all duration-200 hover:rotate-90"
            >
              <FaTimes size={16} />
            </button>

            <h2 className="text-2xl font-bold text-sky-900 mb-1 text-center tracking-tight">
              Send a Note
            </h2>
            <p className="text-sm text-sky-400 text-center mb-6">share something kind with the sky</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
              {/* Text Area */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind today?"
                  maxLength={100}
                  className="w-full h-28 p-4 bg-white/60 border border-sky-100/80 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-transparent font-handwriting text-2xl text-gray-700 shadow-inner placeholder-gray-400/60 transition-all duration-200"
                />
                <span className={`absolute bottom-3 right-3 text-xs font-medium transition-colors ${text.length >= 90 ? (text.length >= 100 ? 'text-red-400 font-bold' : 'text-amber-400') : 'text-gray-400'}`}>
                  {text.length}/100
                </span>
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Choose your shape</label>
                <div className="flex justify-between gap-2">
                  <TypeButton 
                    type="sticky" 
                    icon={<FaStickyNote size={22} />} 
                    label="Sticky" 
                    color="bg-yellow-100 text-yellow-600 border-yellow-200"
                    selected={selectedType === "sticky"} 
                    onClick={() => setSelectedType("sticky")} 
                  />
                  <TypeButton 
                    type="crumpled" 
                    icon={<CgScrollH size={26} />} 
                    label="Crumpled" 
                    color="bg-pink-100 text-pink-600 border-pink-200"
                    selected={selectedType === "crumpled"} 
                    onClick={() => setSelectedType("crumpled")} 
                  />
                  <TypeButton 
                    type="plane" 
                    icon={<PaperPlaneIcon size={24} />} 
                    label="Plane" 
                    color="bg-blue-100 text-blue-600 border-blue-200"
                    selected={selectedType === "plane"} 
                    onClick={() => setSelectedType("plane")} 
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Attach a photo (optional)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-all cursor-pointer bg-white/50 border border-sky-100/80 rounded-xl outline-none"
                  />
                </div>
                {imageFile && (
                  <p className="mt-2 text-xs text-sky-600 px-1 font-medium truncate">
                    📎 {imageFile.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || (!text.trim() && !imageFile)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-1 w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-600 hover:via-blue-600 hover:to-sky-700 text-white font-semibold rounded-xl shadow-[0_4px_20px_0_rgba(0,80,160,0.35)] hover:shadow-[0_8px_30px_rgba(0,80,160,0.3)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Releasing...
                  </span>
                ) : (
                  "Send into the sky ☁️"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Sub-component for the Type selector buttons
function TypeButton({ type, icon, label, color, selected, onClick }: { type: string, icon: ReactNode, label: string, color: string, selected: boolean, onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl flex-1 border-2 transition-all duration-200 ${
        selected 
          ? `${color} shadow-sm ring-2 ring-offset-1 ring-sky-300/50` 
          : "bg-white/40 border-transparent text-gray-400 hover:bg-white/60 hover:text-gray-600"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </motion.button>
  );
}
