
import React from 'react';
import { Briefcase, TrendingUp, Users, Code } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
       <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Enterprise Services</h1>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                  Beyond our software, CodimAi offers expert consulting to help large organizations navigate the shift to AI-driven search.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333] flex gap-6">
                  <div className="bg-red-900/20 p-4 h-fit rounded-xl text-red-500">
                      <Briefcase size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold mb-3">GEO Consulting</h3>
                      <p className="text-gray-400 mb-4">
                          Our experts analyze your entire digital footprint to optimize for Generative Engines. We provide a roadmap to become the cited authority in your industry.
                      </p>
                      <button className="text-red-500 font-semibold hover:text-red-400">Learn more</button>
                  </div>
              </div>

              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333] flex gap-6">
                  <div className="bg-blue-900/20 p-4 h-fit rounded-xl text-blue-500">
                      <TrendingUp size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold mb-3">SEO Strategy & Audit</h3>
                      <p className="text-gray-400 mb-4">
                          Deep-dive technical audits for sites with 100k+ pages. We handle complex migrations, JS rendering issues, and international SEO structures.
                      </p>
                      <button className="text-blue-500 font-semibold hover:text-blue-400">Learn more</button>
                  </div>
              </div>

              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333] flex gap-6">
                  <div className="bg-green-900/20 p-4 h-fit rounded-xl text-green-500">
                      <Code size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold mb-3">API Integration</h3>
                      <p className="text-gray-400 mb-4">
                          Integrate CodimAi's analysis engine directly into your CMS or internal dashboards. Custom endpoints for high-volume automated reporting.
                      </p>
                      <button className="text-green-500 font-semibold hover:text-green-400">View Documentation</button>
                  </div>
              </div>

              <div className="bg-[#121212] p-8 rounded-2xl border border-[#333] flex gap-6">
                  <div className="bg-purple-900/20 p-4 h-fit rounded-xl text-purple-500">
                      <Users size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold mb-3">Corporate Training</h3>
                      <p className="text-gray-400 mb-4">
                          Workshops and training sessions for marketing teams to understand the nuances of Generative AI and its impact on organic search.
                      </p>
                      <button className="text-purple-500 font-semibold hover:text-purple-400">Schedule Workshop</button>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default Services;
