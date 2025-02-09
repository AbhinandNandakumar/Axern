import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FrontPage = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(input);
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setResponse((prev) => prev + chunk);
        setInput("");
      }
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
    <div className="min-h-screen text-white">
      <div className="container mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Axern AI</h1>
          </div>
          <p className="text-sm md:text-base text-gray-300">The powerful prompt generator</p>
        </header>

        <main className="flex-grow flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-xl">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="w-full h-24 md:h-32 bg-gray-600/50 text-white rounded-lg p-3 md:p-4 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                       text-white rounded-lg py-2 px-2 md:px-4 flex items-center gap-2 
                       transition-all transform hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                
              </button>
            </div>
          </div>

          {response && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl 
                          transform transition-all duration-300 ease-in-out">
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
          )}
        </main>
      </div>
    </div>
  );
};

export default FrontPage;
