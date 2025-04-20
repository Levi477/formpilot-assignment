import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Copy, Mail } from 'lucide-react'; 

export default function Home() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(null);
  const [msg, setMsg] = useState('');
  const [rechargeCount, setRechargeCount] = useState(0);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  const getCredits = async () => {
    const res = await axios.get('/api/user/credits');
    setCredits(res.data.credits);
  };

const handleRecharge = async () => {
  if (rechargeCount >= 2) {
    setMsg('Recharge limit reached. Please send an email for more credits.');
    setShowEmailPrompt(true);
    return;
  }

  try {
    const res = await axios.post('/api/user/recharge');
    setMsg(res.data.status);
    await getCredits();
    const newCount = rechargeCount + 1;
    setRechargeCount(newCount);
    
    // Optional: you can still show the prompt on second try
    if (newCount === 2) {
      setShowEmailPrompt(true);
    }
  } catch (err) {
    setMsg(err.response?.data?.error || 'Error occurred');
  }
};
  const handleSendEmail = async () => {
    try {
      // Open email client
      const emailSubject = "Recharge Credit for Crud DB";
      const emailAddress = "deepgajjar54@gmail.com";
      const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}`;
      window.open(mailtoLink, '_blank');
      
      // Hide the email prompt
      setShowEmailPrompt(false);
      
      // Update message
      setMsg('Email client opened. Adding 4 more credits...');
      
      // Simulate processing the email by adding 4 credits directly
      // In a real application, this should be a separate API call
      setTimeout(async () => {
        try {
          // Use a custom endpoint to add 4 more credits
          await axios.post('/api/user/email-bonus-credits');
          
          // Update credits display
          getCredits();
          
          // Show success message
          setMsg('Email sent! 4 bonus credits added.');
        } catch (error) {
          setMsg('Error adding bonus credits.');
        }
      }, 2000); // Wait 2 seconds to simulate processing time
    } catch (err) {
      setMsg('Error opening email client.');
    }
  };

  useEffect(() => {
    if (session) getCredits();
  }, [session]);

  // Create static positions for animations to avoid hydration errors
  const backgroundElements = [
    { size: 300, x1: -100, y1: -100, x2: 50, y2: 100, duration: 20, delay: 0 },
    { size: 200, x1: 200, y1: -150, x2: 300, y2: 100, duration: 25, delay: 2 },
    { size: 400, x1: 500, y1: -200, x2: 400, y2: 200, duration: 30, delay: 5 },
    { size: 350, x1: -200, y1: 300, x2: 100, y2: 200, duration: 22, delay: 7 },
    { size: 250, x1: 600, y1: 400, x2: 500, y2: 300, duration: 28, delay: 10 },
    { size: 180, x1: 300, y1: 500, x2: 400, y2: 400, duration: 24, delay: 3 },
    { size: 280, x1: -150, y1: 600, x2: 0, y2: 500, duration: 26, delay: 6 },
    { size: 220, x1: 700, y1: 100, x2: 600, y2: 200, duration: 27, delay: 8 },
  ];
  
  const gridLines = Array.from({ length: 10 }).map((_, i) => i * 10);
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMsg('Copied to clipboard!');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-gray-800 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden"
    >
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {gridLines.map((position, i) => (
            <motion.div 
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-blue-500"
              style={{ top: `${position}%` }}
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: [0.2, 0.6, 0.2],
                scaleY: [1, 1.5, 1],
              }}
              transition={{
                duration: 8,
                delay: i * 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
          {gridLines.map((position, i) => (
            <motion.div 
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-blue-500"
              style={{ left: `${position}%` }}
              initial={{ opacity: 0.2 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scaleX: [1, 1.5, 1],
              }}
              transition={{
                duration: 10,
                delay: i * 0.3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
        </div>
        {/* Floating elements */}
        {backgroundElements.map((el, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500 opacity-5"
            style={{
              width: el.size,
              height: el.size,
              left: el.x1,
              top: el.y1,
            }}
            animate={{
              x: [0, el.x2],
              y: [0, el.y2],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: el.duration,
              delay: el.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Background glow effect */}
        <motion.div
          className="absolute rounded-full bg-blue-600 opacity-10 blur-3xl"
          style={{
            width: 600,
            height: 600,
            left: '50%',
            top: '50%',
            marginLeft: -300,
            marginTop: -300,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </div>
      {/* Title Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-md shadow-lg flex items-center justify-center z-10 border-b border-blue-900/30"
      >
        <div className="flex items-center">
          <div className="mr-2 text-blue-500">
            <motion.svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" />
              <path d="M15 7H9v2h6V7zm0 4H9v2h6v-2zm0 4H9v2h6v-2z" />
            </motion.svg>
          </div>
          <h1 className="text-xl font-bold tracking-wider" style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}>CRUD-DB</h1>
        </div>
      </motion.div>
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold mb-8 tracking-wide text-center mt-16 relative z-10"
        style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}
      >
        <span className="text-blue-400">CRUD</span>-DB
        <motion.div 
          className="absolute -inset-4 rounded-lg bg-blue-500/5 -z-10"
          animate={{ 
            boxShadow: [
              "0 0 0 rgba(59, 130, 246, 0)", 
              "0 0 20px rgba(59, 130, 246, 0.3)", 
              "0 0 0 rgba(59, 130, 246, 0)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.h1>
      {!session ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10"
        >
          <motion.div
            className="absolute -inset-4 rounded-full bg-blue-500/10 blur-md -z-10"
            animate={{ 
              scale: [0.95, 1.05, 0.95],
              opacity: [0.2, 0.3, 0.2] 
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signIn('google')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all px-6 py-3 text-white text-lg font-medium rounded-xl shadow-lg flex items-center"
            style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3-3.07 4.53-5.66 4.53-3.41 0-6.19-2.73-6.19-6.12s2.78-6.12 6.19-6.12c1.93 0 3.63.79 4.98 2.06l2.05-2.05C18.36 4.33 15.93 3 13.03 3 8.14 3 4.26 6.96 4.26 12s3.88 9 8.77 9c4.69 0 8.36-3.32 8.36-8.03 0-.66-.07-1.29-.17-1.87z" />
            </svg>
            Sign in with Google
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-lg bg-gray-900/70 backdrop-blur-md text-white rounded-2xl shadow-2xl p-6 border border-gray-800/50 relative z-10"
        >
          {/* Glowing effect behind the card */}
          <motion.div 
            className="absolute -inset-2 bg-blue-500/5 rounded-3xl blur-xl -z-10"
            animate={{ 
              boxShadow: [
                "0 0 0 rgba(59, 130, 246, 0)", 
                "0 0 30px rgba(59, 130, 246, 0.2)", 
                "0 0 0 rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border-b border-gray-800/80 pb-4 mb-4"
          >
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}>
              Welcome, {session.user?.name}
            </h2>
            <div className="flex items-center text-gray-300 mb-1">
              <svg className="w-4 h-4 mr-2 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z" />
              </svg>
              <span>{session.user?.email}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <div className="flex flex-col space-y-1">
              <p className="text-gray-400 text-sm">API URL</p>
              <div className="bg-gray-800/80 rounded-lg p-3 text-blue-300 font-mono text-sm overflow-x-auto border border-gray-700/50 flex items-center justify-between">
                <span className="overflow-x-auto">{session.user?.apiUrl || 'Not available'}</span>
                <button 
                  onClick={() => copyToClipboard(session.user?.apiUrl || 'Not available')}
                  className="p-2 hover:bg-gray-700 rounded-full transition flex-shrink-0"
                  title="Copy API URL"
                >
                  <Copy className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <p className="text-gray-400 text-sm">API KEY</p>
              <div className="bg-gray-800/80 rounded-lg p-3 text-green-300 font-mono text-sm overflow-x-auto border border-gray-700/50 flex items-center justify-between">
                <span className="overflow-x-auto">{session.user?.apiKey || 'Hidden'}</span>
                <button 
                  onClick={() => copyToClipboard(session.user?.apiKey || '')}
                  className="p-2 hover:bg-gray-700 rounded-full transition flex-shrink-0"
                  title="Copy API Key"
                >
                  <Copy className="w-5 h-5 text-blue-400" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4 flex items-center justify-between border border-gray-700/30">
              <div>
                <p className="text-gray-400 text-sm">CREDITS</p>
                <p className="text-2xl font-bold text-white">{credits}</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all flex items-center shadow-lg"
                onClick={handleRecharge}
                style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}
              >
                <motion.svg 
                  className="w-4 h-4 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </motion.svg>
                Recharge Credits
              </motion.button>
            </div>
          </motion.div>
          
          {/* Email prompt modal */}
          {showEmailPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-blue-900/30 backdrop-blur-md rounded-xl p-4 border border-blue-800/50"
            >
              <div className="flex items-start mb-3">
                <Mail className="w-5 h-5 text-blue-400 mr-2 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-300">Get More Credits</h3>
                  <p className="text-sm text-gray-300">Send an email to get 4 additional credits.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowEmailPrompt(false)} 
                  className="px-3 py-1 text-sm text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm shadow-lg flex items-center"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Send Email
                </button>
              </div>
            </motion.div>
          )}
          
          {msg && !showEmailPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm p-3 mt-4 text-center rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20"
            >
              {msg}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 pt-4 border-t border-gray-800/80 flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-all flex items-center shadow-lg"
              style={{ fontFamily: "'Futura', 'Trebuchet MS', sans-serif" }}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Sign out
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
