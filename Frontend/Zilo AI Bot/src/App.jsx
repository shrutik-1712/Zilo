import React, { useState } from 'react';
import { Send, ShoppingBag } from 'lucide-react';

export default function ZiloFashionChat() {
  const [gender, setGender] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || !gender) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, message: input })
      });

      const data = await response.json();
      
      const botMessage = {
        type: 'bot',
        text: data.message,
        products: data.products
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        products: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!gender) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <ShoppingBag className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Zilo Fashion Store</h1>
            <p className="text-gray-600">Your AI Shopping Assistant</p>
          </div>
          
          <p className="text-gray-700 mb-6 text-center">Select your category to get started</p>
          
          <div className="space-y-3">
            <button
              onClick={() => setGender('men')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition"
            >
              Shop Men's Collection
            </button>
            <button
              onClick={() => setGender('women')}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 rounded-lg transition"
            >
              Shop Women's Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Zilo Fashion Store</h1>
              <p className="text-sm text-gray-600">{gender === 'men' ? "Men's" : "Women's"} Collection</p>
            </div>
          </div>
          <button
            onClick={() => { setGender(''); setMessages([]); }}
            className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Change Category
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Ask me anything about fashion!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button onClick={() => setInput("Looking for formal office wear")} className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200">Formal office wear</button>
                <button onClick={() => setInput("Casual weekend outfit")} className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200">Casual weekend</button>
                <button onClick={() => setInput("Wedding outfit under 2000")} className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200">Wedding outfit</button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl ${msg.type === 'user' ? 'bg-purple-600 text-white' : 'bg-white'} rounded-2xl p-4 shadow`}>
                <p className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}>{msg.text}</p>
                
                {msg.products && msg.products.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {msg.products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => window.open(product.product_url, '_blank')}
                        className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition group"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                          <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            {product.mrp > product.price && (
                              <>
                                <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                                <span className="text-xs text-green-600 font-semibold">{product.discount}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you're looking for..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}