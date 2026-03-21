"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { NoteData } from "../app/actions";

interface FloatingNoteProps {
  note: NoteData;
}

function getClosedNoteImage(type: NoteData["type"]): string {
  if (type === "sticky") return "/letterheart.png";
  if (type === "crumpled") return "/paper.jpg";
  return "/paperplane1.png";
}

function hash01(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function between(seed: string, min: number, max: number): number {
  return min + (max - min) * hash01(seed);
}

export default function FloatingNote({ note }: FloatingNoteProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use deterministic values so server HTML and client hydration always match.
  const animStyles = useMemo(() => {
    const duration = between(`${note.id}:duration`, 15, 30);
    const delay = between(`${note.id}:delay`, -20, 0);
    const swayDuration = between(`${note.id}:swayDuration`, 3, 7);
    const swayAmount = between(`${note.id}:swayAmount`, 10, 40);
    const initialRotate = between(`${note.id}:initialRotate`, -10, 10);
    const xPos = between(`${note.id}:xPos`, 2, 87);
    const stickyRotate = between(`${note.id}:stickyRotate`, -3, 3);

    return {
      duration,
      delay,
      swayDuration,
      swayAmount,
      initialRotate,
      xPos,
      stickyRotate,
    };
  }, [note.id]);

  // Inner content variation based on type
  const renderNoteContent = (isOpened: boolean = false) => {
    switch (note.type) {
      case "sticky":
        return (
          <div
            className={`relative flex items-center justify-center p-4 shadow-md ${note.color} ${isOpened ? 'w-full h-full' : 'w-28 h-28 sm:w-32 sm:h-32 opacity-90'}`}
            style={{
              boxShadow: isOpened
                ? "4px 8px 20px rgba(0,0,0,0.12), inset 0 0 20px rgba(255,255,255,0.3)"
                : "2px 4px 8px rgba(0,0,0,0.12), inset 0 0 10px rgba(0,0,0,0.05)",
              borderBottomRightRadius: isOpened ? "20px 5px" : "30px 10px",
              transform: isOpened ? undefined : `rotate(${animStyles.stickyRotate}deg)`,
            }}
          >
            {isOpened ? (
              <p className="font-handwriting text-gray-800 leading-tight text-center text-3xl sm:text-4xl">
                {note.text}
              </p>
            ) : (
              <img
                src={getClosedNoteImage("sticky")}
                alt="Sticky note"
                className="h-full w-full object-cover rounded-[inherit]"
              />
            )}
          </div>
        );
      case "crumpled":
        return (
          <div
            className={`relative flex items-center justify-center ${note.color} ${isOpened ? 'w-full h-full p-6' : 'w-20 h-20 sm:w-24 sm:h-24 p-3'}`}
            style={{
              borderRadius: isOpened
                ? "45% 55% 40% 60% / 55% 45% 60% 40%"
                : "50% 40% 55% 45% / 40% 55% 45% 50%",
              boxShadow: isOpened
                ? "inset 3px 3px 8px rgba(255,255,255,0.5), inset -4px -4px 12px rgba(0,0,0,0.08), 4px 8px 20px rgba(0,0,0,0.1)"
                : "inset 4px 4px 10px rgba(255,255,255,0.6), inset -6px -6px 15px rgba(0,0,0,0.15), 3px 6px 12px rgba(0,0,0,0.12)",
            }}
          >
            {isOpened ? (
              <p className="font-handwriting text-gray-800 leading-tight text-center text-3xl sm:text-4xl">
                {note.text}
              </p>
            ) : (
              <img
                src={getClosedNoteImage("crumpled")}
                alt="Crumpled paper note"
                className="h-full w-full object-cover rounded-[inherit]"
              />
            )}
          </div>
        );
      case "plane":
        return (
          <div
            className={`relative flex items-center justify-center p-4 bg-white ${isOpened ? "w-full h-full" : "w-36 h-36 sm:w-44 sm:h-44"}`}
            style={{
              boxShadow: isOpened
                ? "4px 8px 20px rgba(0,0,0,0.12), inset 0 0 14px rgba(255,255,255,0.35)"
                : "2px 4px 10px rgba(0,0,0,0.16), inset 0 0 10px rgba(0,0,0,0.04)",
              borderBottomRightRadius: isOpened ? "16px 4px" : "24px 8px",
              border: "1px solid rgba(15,23,42,0.06)",
              transform: isOpened ? undefined : `rotate(${animStyles.stickyRotate * 0.8}deg)`,
            }}
          >
            {isOpened ? (
              <>
                <div className="absolute right-0 top-0 h-7 w-7 bg-slate-100/80 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
                <p className="font-handwriting text-gray-800 leading-tight text-center text-3xl sm:text-4xl">
                  {note.text}
                </p>
              </>
            ) : (
              <div className="relative flex h-full w-full items-center justify-center">
                <img
                  src={getClosedNoteImage("plane")}
                  alt="Paper plane note"
                  className="h-full w-full object-cover rounded-[inherit]"
                />
              </div>
            )}
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]" />
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none bg-gradient-to-br from-white/50 to-transparent" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 
        We use Framer Motion's AnimatePresence and layoutId to seamlessly 
        morph the floating tiny note into the giant centered card 
      */}
      <div
        className="antigravity-float cursor-pointer"
        style={{
          left: `${animStyles.xPos}vw`,
          //@ts-ignore
          "--float-duration": `${animStyles.duration}s`,
          "--float-delay": `${animStyles.delay}s`,
          // If it's open, pause the underlying CSS float so it doesn't drift away
          animationPlayState: isOpen ? "paused" : "running",
          zIndex: isOpen ? 60 : 10,
        }}
        onClick={() => setIsOpen(true)}
      >
        {!isOpen && (
          <motion.div
            animate={{
              x: [-animStyles.swayAmount, animStyles.swayAmount, -animStyles.swayAmount],
              rotate: [animStyles.initialRotate - 5, animStyles.initialRotate + 5, animStyles.initialRotate - 5],
            }}
            transition={{
              duration: animStyles.swayDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.2,
              rotate: 0,
              transition: { duration: 0.25, type: "spring", stiffness: 300 },
            }}
            className="will-change-transform"
          >
            {renderNoteContent(false)}
          </motion.div>
        )}
      </div>

      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              data-note-overlay
              className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-md pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                }}
              />
              
              {/* Centered Large Card */}
              <motion.div
                className="relative w-[85vw] max-w-[550px] aspect-square sm:aspect-4/3 z-10 perspective-1000 pointer-events-auto overflow-hidden rounded-2xl"
                style={{ outline: "none", border: "none" }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
              >
                <FlipCardContainer note={note} renderNoteContent={renderNoteContent} />
              </motion.div>

              {/* Close Button — prominent pill at the bottom center */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                onClick={() => setIsOpen(false)}
                className="absolute bottom-8 sm:bottom-12 z-20 pointer-events-auto px-8 py-3 bg-white/90 hover:bg-white text-gray-800 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm border border-white/50 text-base"
              >
                Close ✕
              </motion.button>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// Extracted the 3D portion to a sub-component so it can maintain its own tiny flip state
function FlipCardContainer({ note, renderNoteContent }: { note: NoteData, renderNoteContent: (o: boolean) => ReactNode }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div 
      className={`relative w-full h-full transform-style-3d ${note.imageUrl ? 'cursor-pointer' : ''}`}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
      onClick={() => {
        if (note.imageUrl) setIsFlipped(!isFlipped);
      }}
      style={{ outline: "none", border: "none" }}
    >
      {/* Front of Card (The original shape, expanded) */}
      <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-2xl overflow-hidden">
         {renderNoteContent(true)}
         
         {/* Hint to flip */}
         {note.imageUrl && (
           <span className="absolute bottom-6 right-8 text-sm text-gray-800 bg-white/80 px-4 py-2 rounded-full font-sans animate-pulse shadow-md z-20">
             Tap to see handwriting ↺
           </span>
         )}
      </div>

      {/* Back of Card (The Image) */}
      {note.imageUrl && (
        <div 
          className={`absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center p-4 bg-white shadow-2xl rounded-2xl overflow-hidden`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full relative border-8 border-white shadow-inner bg-gray-50 overflow-hidden flex flex-col items-center rounded-xl">
            <img 
              src={note.imageUrl} 
              alt="Handwritten note upload" 
              className="w-full h-full object-contain"
            />
            <p className="absolute bottom-4 font-handwriting text-2xl text-gray-800 bg-white/90 px-6 py-2 rounded-xl shadow-md">
              {note.text}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
