'use client';

import { useState, useEffect } from 'react';
import { BarChart3, ExternalLink, Settings, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsDashboard() {
  const [gaUrl, setGaUrl] = useState<string>('');
  const [gscUrl, setGscUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ga' | 'gsc'>('ga');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.integrations?.googleAnalyticsUrl) {
            setGaUrl(data.integrations.googleAnalyticsUrl);
          }
          if (data.integrations?.googleSearchConsoleUrl) {
            setGscUrl(data.integrations.googleSearchConsoleUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">Google Analytics Dashboard</h1>
          <p className="text-gray-500 font-medium italic text-sm">Real-time performance metrics and user behavior intelligence via Google Analytics 4.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href="/admin/settings"
            className="flex items-center space-x-2 px-6 py-3 border border-gray-200 bg-white text-secondary text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Configure GA</span>
          </Link>
          {((activeTab === 'ga' && gaUrl) || (activeTab === 'gsc' && gscUrl)) && (
            <a 
              href={activeTab === 'ga' ? gaUrl : gscUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-secondary/90 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in Fullscreen</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('ga')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'ga' ? 'border-b-2 border-primary text-secondary' : 'text-gray-400 hover:text-secondary'
          }`}
        >
          Google Analytics
        </button>
        <button
          onClick={() => setActiveTab('gsc')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'gsc' ? 'border-b-2 border-primary text-secondary' : 'text-gray-400 hover:text-secondary'
          }`}
        >
          Search Console
        </button>
      </div>

      <div className="flex-1 min-h-[500px] bg-white border border-gray-100 overflow-hidden relative group flex flex-col">
        {(activeTab === 'ga' ? gaUrl : gscUrl) ? (
          <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2 shadow-inner ring-4 ring-green-50/50">
              <BarChart3 className="w-12 h-12" />
            </div>
            <div className="max-w-md space-y-3">
              <h3 className="text-2xl font-black text-secondary uppercase tracking-tight">{activeTab === 'ga' ? 'Google Analytics' : 'Search Console'} Ready</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Your {activeTab === 'ga' ? 'Google Analytics' : 'Search Console'} dashboard is connected. For security reasons, Google requires these dashboards to be opened in a new secure tab rather than embedded directly.
              </p>
            </div>
            
            <a 
              href={activeTab === 'ga' ? gaUrl : gscUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-primary text-white text-sm font-black uppercase tracking-widest hover:bg-secondary hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 flex items-center space-x-3 group"
            >
              <span>Launch Dashboard</span>
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        ) : (
          <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <BarChart3 className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-black text-secondary uppercase tracking-tight">{activeTab === 'ga' ? 'Analytics' : 'Search Console'} Not Configured</h3>
              <p className="text-gray-500 text-sm font-medium">
                To view your live performance data, you need to provide a {activeTab === 'ga' ? 'Google Analytics' : 'Search Console'} dashboard URL in the system settings.
              </p>
            </div>
            <Link 
              href="/admin/settings"
              className="px-8 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              Go to Settings
            </Link>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Session Intelligence</p>
              <h4 className="text-sm font-bold text-secondary mb-2">User Acquisition</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Track where your visitors are coming from and which campaigns are driving the most high-value traffic.</p>
          </div>
          <div className="p-6 bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Engagement Metrics</p>
              <h4 className="text-sm font-bold text-secondary mb-2">Behavior Flow</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Monitor how users navigate through LabZenix product categories and blog content to optimize conversion paths.</p>
          </div>
          <div className="p-6 bg-white border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Conversion Tracking</p>
              <h4 className="text-sm font-bold text-secondary mb-2">Inquiry Performance</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Analyze the correlation between organic search performance and technical inquiry generation rates.</p>
          </div>
      </div>
    </div>
  );
}
