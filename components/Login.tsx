"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-red-600 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-5xl font-extrabold mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Sign in to Your Dashboard
      </motion.h1>
      <motion.button
        onClick={() => signIn("google")}
        className="bg-white text-red-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Sign in with Google
      </motion.button>
    </motion.div>
  );
}

