
import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog: React.FC = () => {
  const posts = [
    {
      id: 1,
      title: "The Rise of Generative Engine Optimization (GEO)",
      excerpt: "Why traditional SEO keywords are losing relevance and how entities are taking over the search landscape.",
      author: "Dr. Aditi Sharma",
      date: "Oct 12, 2025",
      category: "Industry Trends",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 2,
      title: "5 Ways to Prepare Your Site for Google SGE",
      excerpt: "Search Generative Experience is changing the SERP layout. Here is your checklist to stay visible.",
      author: "Rahul Mehta",
      date: "Sep 28, 2025",
      category: "Technical SEO",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 3,
      title: "Core Web Vitals: The 2024 Update",
      excerpt: "Interaction to Next Paint (INP) has replaced FID. Learn what this means for your frontend performance.",
      author: "Sarah Jenkins",
      date: "Sep 15, 2025",
      category: "Performance",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: 4,
      title: "Leveraging AI for Content Scalability",
      excerpt: "How to use LLMs to assist your writing process without losing the human touch or violating spam policies.",
      author: "David Chen",
      date: "Aug 30, 2025",
      category: "Content Strategy",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end border-b border-[#333] pb-8">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">The CodimAi Blog</h1>
                <p className="text-gray-400 max-w-xl">Insights, updates, and guides on the future of search and artificial intelligence.</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
                <button className="px-4 py-2 rounded-full bg-[#222] text-sm text-white hover:bg-[#333]">All</button>
                <button className="px-4 py-2 rounded-full bg-black border border-[#333] text-sm text-gray-400 hover:text-white">SEO</button>
                <button className="px-4 py-2 rounded-full bg-black border border-[#333] text-sm text-gray-400 hover:text-white">AI</button>
                <button className="px-4 py-2 rounded-full bg-black border border-[#333] text-sm text-gray-400 hover:text-white">Engineering</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {posts.map((post) => (
                <div key={post.id} className="group cursor-pointer">
                    <div className="overflow-hidden rounded-2xl mb-4 border border-[#222]">
                        <img 
                            src={post.image} 
                            alt={post.title} 
                            className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="text-red-500 font-bold uppercase tracking-wider">{post.category}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                        <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors">{post.title}</h2>
                    <p className="text-gray-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <button className="flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                        Read Article <ArrowRight size={16} />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
