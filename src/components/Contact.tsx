
import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info Section */}
            <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                <p className="text-gray-400 text-lg mb-10">
                    Have questions about enterprise plans, partnerships, or general support? We're here to help you optimize your search presence.
                </p>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="bg-[#222] p-3 rounded-lg text-red-500">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Headquarters</h3>
                            <p className="text-gray-400">1402, Cyber One, Vashi</p>
                            <p className="text-gray-400">Navi Mumbai, India - 400703</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-[#222] p-3 rounded-lg text-red-500">
                            <Phone size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Phone</h3>
                            <p className="text-gray-400">+91 83698 93412</p>
                            <p className="text-gray-500 text-sm mt-1">Mon-Fri from 9am to 6pm IST</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-[#222] p-3 rounded-lg text-red-500">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Email</h3>
                            <p className="text-gray-400">support@codimai.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-[#121212] p-8 rounded-2xl border border-[#333] shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">First Name</label>
                            <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Last Name</label>
                            <input type="text" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="Doe" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                        <input type="email" className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="john@company.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Subject</label>
                        <select className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors">
                            <option>General Inquiry</option>
                            <option>Support</option>
                            <option>Sales</option>
                            <option>Partnership</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Message</label>
                        <textarea rows={4} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors" placeholder="How can we help you?"></textarea>
                    </div>

                    <button type="button" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2">
                        Send Message <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
