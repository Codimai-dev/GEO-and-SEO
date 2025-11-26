
import React from 'react';
import { Check, X } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '\u20B90',
      period: '/forever',
      description: 'Essential tools for individuals and small blogs.',
      features: [
        'Basic SEO Analysis',
        '3 Daily Analysis Reports',
        'Core Web Vitals Check',
        'Standard Support',
        'Mobile Optimization Tips'
      ],
      notIncluded: [
        'AI GEO Recommendations',
        'Competitor Analysis',
        'API Access',
        'White-label Reports'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '\u20B92,499',
      period: '/month',
      description: 'Advanced AI insights for growing businesses.',
      features: [
        'Unlimited SEO Analysis',
        'Deep AI GEO Insights',
        'Competitor Tracking (5 Sites)',
        'Priority Email Support',
        'Content Optimization AI',
        'Keyword Gap Analysis'
      ],
      notIncluded: [
        'API Access',
        'White-label Reports'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Agency',
      price: '\u20B98,999',
      period: '/month',
      description: 'Complete power for agencies and large teams.',
      features: [
        'Everything in Professional',
        'Competitor Tracking (25 Sites)',
        'White-label PDF Reports',
        'API Access',
        'Dedicated Account Manager',
        'Team Collaboration (5 Users)'
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-[#000] text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
          Choose the plan that fits your growth. No hidden fees. Cancel anytime.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-[#121212] rounded-2xl border ${plan.popular ? 'border-red-600 shadow-[0_0_30px_-10px_rgba(220,38,38,0.4)]' : 'border-[#333]'} p-8 flex flex-col transition-transform hover:-translate-y-2`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 ml-1">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-8 h-10">{plan.description}</p>

              <ul className="space-y-4 mb-8 flex-1 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-red-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <X size={16} className="text-gray-700 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.popular ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#222] hover:bg-[#333] text-white border border-[#444]'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
