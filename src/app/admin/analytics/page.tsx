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

      <div className="flex-1 min-h-[750px] bg-white border border-gray-100 overflow-hidden relative group">
        {(activeTab === 'ga' ? gaUrl : gscUrl) ? (
          <div className="w-full h-full relative flex flex-col">
             <div className="absolute top-0 right-0 z-10 p-4">
                <a 
                  href={activeTab === 'ga' ? gaUrl : gscUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center space-x-2"
                >
                  <span>Open Direct Link</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
             </div>
             <iframe 
                src={activeTab === 'ga' ? gaUrl : gscUrl}
                className="w-full h-full flex-1 border-none min-h-[600px]"
                title={`${activeTab === 'ga' ? 'Google Analytics' : 'Search Console'} Dashboard`}
                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
             />
             <div className="absolute top-0 left-0 w-full p-2 bg-primary/5 border-b border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Secure Analytics Tunnel Active
             </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
              <BarChart3 className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-black text-secondary uppercase tracking-tight">{activeTab === 'ga' ? 'Analytics' : 'Search Console'} Not Configured</h3>
              <p className="text-gray-500 text-sm font-medium">
                To view your live performance data, you need to provide a {activeTab === 'ga' ? 'Google Analytics' : 'Search Console'} dashboard URL in the system settings.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-none max-w-lg">
              <div className="flex items-start space-x-3 text-amber-800 text-left">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  <span className="font-bold">Security Note:</span> Some dashboard views may block embedding. For the best experience, use a "Shareable Link" or ensure your property allows embedding.
                </p>
              </div>
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
