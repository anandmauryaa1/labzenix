'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Globe, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Campaign deleted');
        fetchCampaigns();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting campaign');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-secondary tracking-tight">Campaign Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage landing pages for specific marketing campaigns.</p>
        </div>
        <Link 
          href="/admin/campaigns/new" 
          className="bg-primary text-white px-4 py-2 text-sm font-bold flex items-center hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Link>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-secondary mb-2">No Campaigns Found</h3>
            <p className="text-gray-500 mb-6 text-sm">Create your first campaign landing page to get started.</p>
            <Link 
              href="/admin/campaigns/new" 
              className="bg-primary text-white px-6 py-2 text-sm font-bold inline-flex items-center hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500 font-black">
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Slug / URL</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 font-bold text-secondary">{campaign.title}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-mono bg-gray-50/50">{campaign.slug}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        campaign.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/campaign/${campaign.slug}`} 
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-primary transition-colors border border-transparent hover:border-gray-200 bg-white"
                          title="View Live Page"
                        >
                          <Globe className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/admin/campaigns/${campaign._id}`} 
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors border border-transparent hover:border-gray-200 bg-white"
                          title="Edit Campaign"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteCampaign(campaign._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors border border-transparent hover:border-gray-200 bg-white"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
