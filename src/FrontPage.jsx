import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { Sparkles, Loader2, History, X, Trash2, Copy, Moon, Sun } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import DecryptedText from "./components/DecryptedText";
import { auth } from "./firebase";

// Create Theme Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    // Apply or remove dark class on document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for theme
export const useTheme = () => useContext(ThemeContext);

const FrontPage = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
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
    throw new Error("No user logged in");
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
      const response = await fetch(
        "https://axern.onrender.com/api/chat-history",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const history = await response.json();
      setChatHistory(history);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const token = await getAuthToken();
      await fetch(`https://axern.onrender.com/api/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChatHistory(chatHistory.filter((chat) => chat.id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse("");
    let fullResponse = "";

    try {
      const token = await getAuthToken();
      const response = await fetch("https://axern.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userInput: input }),
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
      console.error("Error:", error);
      setResponse("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(response);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-blue-50 to-white text-gray-800'}`}>
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-gray-800 shadow-md border-b border-gray-700' : 'bg-white shadow-md border-b border-gray-200'}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/axernlogo.png" alt="Axern" className="h-8 w-auto" />
            <span className={`font-bold text-xl ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Axern</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-700'} transition-colors`}
              onClick={() => setShowHistory(!showHistory)}
              aria-label="View History"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'} text-white px-4 py-2 rounded-md transition-colors text-sm font-medium`}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 pt-24">
        <header className="text-center mb-12 mt-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
            Welcome to Axern AI
          </h1>
          <div className="mt-3">
            <DecryptedText
              text="Enterprise-grade prompt engineering solutions"
              animateOn="view"
              speed={100}
              maxIterations={20}
              revealDirection="start"
              className={`${darkMode ? 'text-blue-300' : 'text-blue-600'} text-xl font-medium`}
              encryptedClassName={darkMode ? "text-blue-500" : "text-blue-400"}
              sequential={true}
            />
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}>
            Leverage our advanced AI technology to generate optimized prompts for your business needs.
            Enhance productivity and creativity with intelligent suggestions.
          </p>
        </header>

        <main className="max-w-4xl mx-auto space-y-8">
          {/* Input Box */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-lg border`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center gap-2`}>
              <Sparkles className="w-5 h-5" />
              Create Your Prompt
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your requirements or ask a question..."
              className={`w-full h-32 ${darkMode ? 'bg-gray-700 text-gray-100 border-gray-600 focus:ring-blue-500' : 'bg-gray-50 text-gray-800 border-gray-300 focus:ring-blue-500'} rounded-lg p-4 focus:outline-none focus:ring-2 resize-none border`}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600' : 'bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400'} disabled:cursor-not-allowed text-white rounded-lg py-2.5 px-6 flex items-center gap-2 font-medium transition-all duration-300 shadow-md`}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Generate Prompt"
                )}
              </button>
            </div>
          </div>

          {/* Response Area */}
          {response ? (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl p-6 shadow-lg border transition-all duration-500 ease-in-out`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-lg font-semibold flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  <Sparkles className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                  AI Response
                </h2>
                <button
                  className={`${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-700 hover:bg-blue-50'} rounded-lg p-2 transition-colors flex items-center gap-1`}
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-4 border`}>
                <div className={`prose ${darkMode ? 'prose-invert' : ''} max-w-none`}>
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-12">
              <h2 className={`text-xl font-semibold text-center mb-8 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                Our Enterprise Solutions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-200'} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex justify-center mb-4">
                    <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-full`}>
                      <Sparkles className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                    </div>
                  </div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-700'} text-center mb-2`}>
                    Instant Prompt Generation
                  </h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                    Generate enterprise-grade prompts with a single click. Powered by
                    our proprietary AI technology.
                  </p>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-200'} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex justify-center mb-4">
                    <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-full`}>
                      <Sparkles className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                    </div>
                  </div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-700'} text-center mb-2`}>
                    AI-Powered Business Solutions
                  </h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                    Tailored prompts optimized for your industry and specific business needs with enterprise-grade security.
                  </p>
                </div>

                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-200'} rounded-xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl`}>
                  <div className="flex justify-center mb-4">
                    <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-100'} p-3 rounded-full`}>
                      <Sparkles className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                    </div>
                  </div>
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-700'} text-center mb-2`}>
                    Enterprise Performance
                  </h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                    Dedicated infrastructure ensures rapid response times and reliable service for all your business needs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
        

        {/* History Panel */}
        {showHistory && (
          <div
            ref={historyRef}
            className={`fixed right-0 top-0 w-full sm:w-96 h-full ${darkMode ? 'bg-gray-800 shadow-2xl border-l border-gray-700' : 'bg-white shadow-2xl border-l border-gray-200'} transition-all duration-300 z-30 overflow-hidden`}
            
          >
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
            <div className={`p-4 ${darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'} flex justify-between items-center`}>
              <h3 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center gap-2`}>
                <History className="w-5 h-5" />
                Conversation History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200 bg-gray-700 hover:bg-gray-600' : 'text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded-full p-1.5 transition-colors`}
                aria-label="Close history"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-4rem)]">
              {historyLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-700'} animate-spin`} />
                </div>
              ) : chatHistory.length > 0 ? (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`${darkMode ? 'bg-gray-700 rounded-lg p-4 space-y-3 relative border border-gray-600 hover:border-blue-500' : 'bg-gray-50 rounded-lg p-4 space-y-3 relative border border-gray-200 hover:border-blue-200'} transition-colors`}
                  >
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className={`absolute top-3 right-3 ${darkMode ? 'text-gray-400 hover:text-red-400 bg-gray-600 hover:bg-gray-500' : 'text-gray-400 hover:text-red-500 bg-gray-200 hover:bg-gray-300'} rounded-full p-1.5 transition-colors`}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(chat.timestamp).toLocaleString()}
                    </div>
                    <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'} font-medium`}>
                      <span className={darkMode ? 'text-blue-400' : 'text-blue-700'}>You:</span> {chat.input}
                    </div>
                    <div className={`${darkMode ? 'text-gray-300 border-t border-gray-600' : 'text-gray-700 border-t border-gray-200'} pt-2 mt-2`}>
                      <div className="flex items-start">
                        <span className={darkMode ? 'text-blue-400 mr-2' : 'text-blue-700 mr-2'}>Axern:</span>
                        <div className={`prose ${darkMode ? 'prose-invert' : ''} prose-sm max-w-none flex-1`}>
                          <ReactMarkdown>{chat.response}</ReactMarkdown>
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(chat.response)
                          }
                          className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-blue-900 text-blue-400' : 'hover:bg-blue-100 text-blue-700'} transition-colors`}
                          aria-label="Copy response"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`flex flex-col items-center justify-center h-64 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <History className="w-12 h-12 mb-3 opacity-50" />
                  <p>No conversation history yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-800 py-6 border-t border-gray-700' : 'bg-white py-6 border-t border-gray-200'} mt-16`}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/axernlogo.png" alt="Axern" className="h-8 w-auto mr-2" />
            <span className={darkMode ? 'text-blue-400 font-medium' : 'text-blue-700 font-medium'}>
              Axern AI © {new Date().getFullYear()}
            </span>
          </div>
          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm hidden md:block`}>
            Axern AI solutions for modern businesses
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;