import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, History, X, Trash2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import DecryptedText from './components/DecryptedText';
import { auth } from './firebase';

const FrontPage = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const historyRef = useRef(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (showHistory) {
      loadChatHistory();
    }
  }, [showHistory]);

  const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    throw new Error('No user logged in');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    }

    if (showHistory) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistory]);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const loadChatHistory = async () => {
    try {
      setHistoryLoading(true); 
      const token = await getAuthToken();
      const response = await fetch('https://axern.onrender.com/api/chat-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const history = await response.json();
      setChatHistory(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setHistoryLoading(false); 
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const token = await getAuthToken();
      await fetch(`https://axern.onrender.com/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    let fullResponse = '';
  
    try {
      const token = await getAuthToken();
      const response = await fetch('https://axern.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userInput: input })
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setResponse((prev) => prev + chunk);
      }
  
      setInput("");
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(response);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 text-white relative">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md shadow-lg border-b border-blue-900/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/axernlogo.png" alt="Axern" className="h-10 w-auto" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Axern
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 pt-24">
        <header className="text-center mb-10 mt-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Axern AI
          </h1>
          <div className="mt-3">
            <DecryptedText
              text="The powerful prompt generator"
              animateOn="view"
              speed={100}
              maxIterations={20}
              revealDirection="start"
              className="text-emerald-400 text-xl font-medium"
              encryptedClassName="text-green-300"
              sequential={true}
            />
          </div>
        </header>

        <main className="max-w-3xl mx-auto space-y-8">
          {/* Input Box */}
          <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-5 shadow-xl border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4 text-blue-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create Your Prompt
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full h-32 bg-gray-800/70 backdrop-blur-sm text-white rounded-lg p-4 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border border-gray-700/50"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                          disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50
                          text-white rounded-lg py-2.5 px-6 flex items-center gap-2 font-medium
                          transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Prompt"}
              </button>
            </div>
          </div>

          {/* Response Area */}
          {response ? (
            <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-5 shadow-xl border border-gray-700/50 transition-all duration-500 ease-in-out">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-300">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  AI Response
                </h2>
                <button 
                  className="text-blue-400 rounded-lg p-2 tooltip tooltip-left hover:bg-blue-900/30 hover:text-blue-300 active:bg-blue-900/50 transition-colors" 
                  data-tip={copied ? "Copied!" : "Copy to clipboard"}
                  onClick={handleCopy}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-center mb-8 text-blue-300">Our Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-5 shadow-xl border border-gray-700/50 transition-all duration-300 hover:transform hover:scale-105 hover:border-blue-500/30">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-full">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-blue-400 text-center mb-2">Instant Prompt Generation</h3>
                  <p className="text-gray-300 text-center">Generate creative prompts with a single click. Powered by advanced AI technology.</p>
                </div>
                
                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-5 shadow-xl border border-gray-700/50 transition-all duration-300 hover:transform hover:scale-105 hover:border-blue-500/30">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-full">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-blue-400 text-center mb-2">AI-Powered Suggestions</h3>
                  <p className="text-gray-300 text-center">Tailored prompts generated by advanced AI technology to match your specific needs.</p>
                </div>

                <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-5 shadow-xl border border-gray-700/50 transition-all duration-300 hover:transform hover:scale-105 hover:border-blue-500/30">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-600/20 p-3 rounded-full">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-blue-400 text-center mb-2">Fast Response Time</h3>
                  <p className="text-gray-300 text-center">Receive prompt suggestions in real-time with our high-performance AI engine.</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* History Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                   text-white rounded-full p-3 shadow-lg transition-all duration-300
                   transform hover:scale-110 z-20"
          aria-label="View History"
        >
          <History className="w-6 h-6" />
        </button>

        {/* History Panel */}
        {showHistory && (
          <div 
            ref={historyRef} 
            className="fixed left-1/2 bottom-0 w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 h-[60vh] bg-gray-900/95 backdrop-blur-md shadow-2xl 
                    transform -translate-x-1/2 transition-all duration-300 
                    rounded-t-xl overflow-hidden border border-gray-700/70 z-30"
          >
            <div className="p-4 bg-gray-800/80 border-b border-gray-700/70 flex justify-between items-center">
              <h3 className="font-semibold text-blue-300 flex items-center gap-2">
                <History className="w-5 h-5" />
                Conversation History
              </h3>
              <button 
                onClick={() => setShowHistory(false)} 
                className="text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
                aria-label="Close history"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(60vh-4rem)]">
              {historyLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : chatHistory.length > 0 ? (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="bg-gray-800/50 rounded-lg p-4 space-y-3 relative border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                    <button 
                      onClick={() => handleDeleteChat(chat.id)} 
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-700/50 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-sm text-gray-400">{new Date(chat.timestamp).toLocaleString()}</div>
                    <div className="text-white font-medium">
                      <span className="text-blue-400">You:</span> {chat.input}
                    </div>
                    <div className="text-gray-300 border-t border-gray-700/50 pt-2 mt-2">
                      <div className="flex items-start">
                        <span className="text-emerald-400 mr-2">Axern:</span> 
                        <div className="prose prose-invert prose-sm max-w-none flex-1">
                          <ReactMarkdown>{chat.response}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => navigator.clipboard.writeText(chat.response)}
                          className="p-1.5 rounded-lg hover:bg-blue-900/30 active:bg-blue-900/50 text-blue-400 hover:text-blue-300 transition-colors"
                          aria-label="Copy response"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <History className="w-12 h-12 mb-3 opacity-50" />
                  <p>No conversation history yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm py-4 border-t border-gray-800/50 mt-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/axernlogo.png" alt="Axern" className="h-8 w-auto mr-2" />
            <span className="text-blue-400 font-medium">Axern AI © {new Date().getFullYear()}</span>
          </div>
          <div className="text-gray-400 text-sm">
            Empowering creativity with AI-generated prompts
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;