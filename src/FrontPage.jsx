import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, History, X,Trash2 } from 'lucide-react';
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

  // Update loadChatHistory
const loadChatHistory = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch('http://localhost:5000/api/chat-history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const history = await response.json();
    setChatHistory(history);
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
};

  // Update handleDeleteChat
const handleDeleteChat = async (chatId) => {
  try {
    const token = await getAuthToken();
    await fetch(`http://localhost:5000/api/chat/${chatId}`, {
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
      const response = await fetch('http://localhost:5000/api/chat', {
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
      // No need to manually save to Firebase anymore as it's handled by the backend
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen pt-20 text-white relative">
      <button
        onClick={handleLogout}
        className="fixed top-20 z-30 right-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        Logout
      </button>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 mt-3">
          <div>
          <DecryptedText
            text="The powerful prompt generator"
            animateOn="view"
            speed={100}
            maxIterations={20}
            revealDirection="start"
            className='text-emerald-400  text-xl text-bold '
            encryptedClassName='text-green-300'
            sequential = {true}
          />
          </div>
        </header>

        <main className="max-w-3xl mx-auto space-y-8">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className="w-full h-24 md:h-32 bg-gray-800/55 backdrop-blur-sm text-white rounded-lg p-3 md:p-4 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-300
                        text-white rounded-lg py-2 px-2 md:px-4 flex items-center gap-2 
                        transition-all transform hover:scale-[1.02] w-1/3 justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className=''>Generate</div>}
              
            </button>
          </div>
        </div>



        {response ? (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl">
    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-yellow-400" />
      Response
    </h2>
    <div className="bg-gray-700/50 rounded-lg p-4">
      <div className="whitespace-pre-wrap text-sm md:text-base">
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </div>
  </div>
) : (
  <div className="flex flex-wrap justify-center gap-6 text-sm text-white">
    <div className="sm:container sm:mx-auto px-4">
      <div className="flex flex-wrap justify-center gap-6">
        <div className="w-80 sm:w-1/2 md:w-1/2 lg:w-1/4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-blue-400">Instant Prompt Generation</h3>
          <p className="mt-1">Generate creative prompts with a single click.</p>
        </div>
        
        <div className="w-80 sm:w-1/2 md:w-1/2 lg:w-1/4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-blue-400">AI-Powered Suggestions</h3>
          <p className="mt-1">Tailored prompts generated by advanced AI technology.</p>
        </div>

        <div className="w-80 sm:w-1/2 md:w-1/2 lg:w-1/4 p-4 bg-gray-900/50 backdrop-blur-sm rounded-lg shadow-md">
          <h3 className="font-bold text-lg text-blue-400">Fast Response Time</h3>
          <p className="mt-1">Receive prompt suggestions in real-time.</p>
        </div>
      </div>
    </div>
  </div>
)}
        </main>

        {/* History Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 
                   text-white rounded-full p-3 shadow-lg transition-all 
                   transform hover:scale-[1.05]"
        >
          <History className="w-6 h-6" />
        </button>

        {/* History Panel */}
        {showHistory && (
          <div className="fixed left-0 bottom-0 w-80 h-[80vh] bg-blue-950/80 shadow-xl 
                        transform transition-all duration-300 rounded-tr-xl overflow-hidden">
            <div className="p-4 bg-gray-800/60 flex justify-between items-center ">
              <h3 className="font-semibold text-gray-300">Chat History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(80vh-4rem)]">
            {chatHistory.map((chat) => (
  <div key={chat.id} className="bg-blue-900/80 rounded-lg p-3 space-y-2 relative">
    <button
      onClick={() => handleDeleteChat(chat.id)}
      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
    >
      <Trash2 className="w-5 h-5" />
    </button>
    <div className="text-sm text-gray-400">
      {new Date(chat.timestamp).toLocaleString()}
    </div>
    <div className="text-sm font-medium">Input: {chat.input}</div>
    <div className="text-sm text-gray-300">
      Response: <ReactMarkdown>{chat.response}</ReactMarkdown>
    </div>
  </div>
))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FrontPage;