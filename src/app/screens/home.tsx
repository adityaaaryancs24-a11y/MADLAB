import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, History, Settings, Keyboard, Search, Filter, Zap, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Home() {
  const navigate = useNavigate();
  const { scanHistory } = useApp();
  const [isScanning, setIsScanning] = useState(false);
  const [scanLineY, setScanLineY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Get recent scans from context
  const recentScans = scanHistory.slice(0, 5);

  // Scanning line animation
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanLineY((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleScanClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      navigate("/loading");
    }, 2000);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-gradient-to-b from-[#0A0E15] via-[#0F141D] to-[#0A0E15] flex flex-col relative overflow-hidden">
      {/* Ambient Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2ECC71] opacity-10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F4A261] opacity-10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 backdrop-blur-xl bg-[#0A0E15]/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71] to-[#25A65A] flex items-center justify-center shadow-lg shadow-[#2ECC71]/30">
            <Zap className="w-5 h-5 text-[#0A0E15]" fill="currentColor" strokeWidth={2} />
          </div>
          <h1 className="font-bold text-white text-[28px] tracking-tight">
            Verity
          </h1>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/search")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <Search className="w-5 h-5 text-[#2ECC71]" strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/watchlist")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <History className="w-5 h-5 text-[#F4A261]" strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
          >
            <Settings className="w-5 h-5 text-white/70" strokeWidth={2} />
          </motion.button>
        </div>
      </div>

      {/* Scan Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Search Shortcut with Glow */}
        <div className="w-full mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/search")}
            className="w-full flex items-center gap-3 px-5 py-4 bg-white/5 backdrop-blur-xl rounded-2xl hover:bg-white/10 border border-white/10 transition-all text-left group shadow-lg shadow-black/20"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/10 flex items-center justify-center group-hover:from-[#2ECC71]/30 group-hover:to-[#2ECC71]/20 transition-all">
              <Search className="w-5 h-5 text-[#2ECC71]" strokeWidth={2} />
            </div>
            <span className="text-white/60 group-hover:text-white/80 transition-colors">Search for products...</span>
          </motion.button>
        </div>

        {/* Viewfinder with Cyberpunk Aesthetics */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-full aspect-[4/3] max-w-sm mb-10"
        >
          {/* Camera View Background with Grid Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2433]/50 to-[#0F1824]/50 rounded-3xl overflow-hidden backdrop-blur-sm border border-white/10">
            {/* Animated Grid */}
            <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzJFQ0M3MSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2ECC71]/10 to-transparent"></div>
          </div>

          {/* Glowing Corner Brackets */}
          <div className="absolute inset-0 p-5">
            {/* Top Left */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-5 left-5 w-12 h-12 border-t-3 border-l-3 border-[#2ECC71] rounded-tl-xl shadow-lg shadow-[#2ECC71]/50"
            ></motion.div>
            {/* Top Right */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute top-5 right-5 w-12 h-12 border-t-3 border-r-3 border-[#2ECC71] rounded-tr-xl shadow-lg shadow-[#2ECC71]/50"
            ></motion.div>
            {/* Bottom Left */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute bottom-5 left-5 w-12 h-12 border-b-3 border-l-3 border-[#2ECC71] rounded-bl-xl shadow-lg shadow-[#2ECC71]/50"
            ></motion.div>
            {/* Bottom Right */}
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="absolute bottom-5 right-5 w-12 h-12 border-b-3 border-r-3 border-[#2ECC71] rounded-br-xl shadow-lg shadow-[#2ECC71]/50"
            ></motion.div>
          </div>

          {/* Scanning Line with Enhanced Glow */}
          {isScanning && (
            <motion.div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#2ECC71] to-transparent shadow-[0_0_20px_#2ECC71]"
              style={{ top: `${scanLineY}%` }}
            />
          )}

          {/* Center Text with Glassmorphism */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-6 py-3 bg-[#0A0E15]/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            >
              <p className="text-white font-semibold text-center">
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#2ECC71] rounded-full animate-pulse shadow-lg shadow-[#2ECC71]/80"></span>
                    Scanning...
                  </span>
                ) : (
                  "Align barcode within frame"
                )}
              </p>
            </motion.div>
          </div>

          {/* Clickable Scan Button */}
          <button
            onClick={handleScanClick}
            className="absolute inset-0 w-full h-full cursor-pointer"
            aria-label="Start scanning"
          />
        </motion.div>

        {/* Scan Button with Neon Glow */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleScanClick}
          className="px-8 py-4 bg-gradient-to-r from-[#2ECC71] to-[#25A65A] rounded-2xl font-bold text-[#0A0E15] shadow-[0_0_40px_rgba(46,204,113,0.4)] hover:shadow-[0_0_60px_rgba(46,204,113,0.6)] transition-all mb-8"
        >
          {isScanning ? "Scanning..." : "Tap to Scan"}
        </motion.button>

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-semibold text-white/70 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2ECC71]" />
                Recent Scans
              </h3>
              <button 
                onClick={() => navigate("/watchlist")}
                className="text-[#2ECC71] text-sm hover:text-[#25A65A] transition-colors"
              >
                View All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 px-2 -mx-2 scrollbar-hide">
              {recentScans.map((scan, index) => (
                <motion.button
                  key={scan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/product/${scan.id}`)}
                  className="flex-shrink-0 w-24 flex flex-col items-center gap-2 group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm shadow-lg relative group-hover:border-[#2ECC71]/50 transition-all">
                    <img
                      src={scan.image}
                      alt={scan.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-xs text-white/50 truncate w-full text-center group-hover:text-[#2ECC71] transition-colors">
                    {formatTimeAgo(scan.timestamp)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Navigation */}
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-around bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/home")}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl bg-gradient-to-br from-[#2ECC71]/20 to-[#2ECC71]/10"
          >
            <Zap className="w-6 h-6 text-[#2ECC71]" fill="currentColor" />
            <span className="text-xs text-[#2ECC71] font-semibold">Scan</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/search")}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl hover:bg-white/5 transition-colors"
          >
            <Search className="w-6 h-6 text-white/50" />
            <span className="text-xs text-white/50">Search</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/watchlist")}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl hover:bg-white/5 transition-colors"
          >
            <History className="w-6 h-6 text-white/50" />
            <span className="text-xs text-white/50">History</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/settings")}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl hover:bg-white/5 transition-colors"
          >
            <Settings className="w-6 h-6 text-white/50" />
            <span className="text-xs text-white/50">Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Custom Scrollbar Hide */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
