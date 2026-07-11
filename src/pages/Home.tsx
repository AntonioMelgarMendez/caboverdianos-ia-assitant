import React from 'react';
import { Map, MessageSquare, Compass } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-medium tracking-tight text-white">AI Travel Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: 3D Assistant & Chat */}
        <div className="w-1/3 flex flex-col border-r border-white/10 relative z-10 bg-zinc-950/80 backdrop-blur-sm">
          {/* 3D Model Viewport Placeholder */}
          <div className="h-1/2 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center group">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950/0 to-zinc-950/0"></div>
             <p className="text-zinc-500 font-mono text-sm z-10">3D Model Viewport (Phase 2)</p>
          </div>
          
          {/* Chat Interface Placeholder */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              <div className="bg-purple-600/20 border border-purple-500/30 text-purple-50 p-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                <p className="text-sm">Hi! I'm your AI Travel Assistant. Where would you like to go today?</p>
              </div>
            </div>
            
            {/* Input Area */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask for recommendations..." 
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 rounded-full text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
           <p className="text-zinc-500 font-mono text-sm">Mapbox Integration (Phase 4)</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
