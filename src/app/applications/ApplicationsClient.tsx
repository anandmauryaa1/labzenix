'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageBanner from '@/components/ui/PageBanner';
import FadeIn from '@/components/ui/FadeIn';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Microscope } from 'lucide-react';

interface Application {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    setLoading(true);
    const url = categoryFilter 
      ? `/api/applications?category=${encodeURIComponent(categoryFilter)}` 
      : '/api/applications';
      
    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [categoryFilter]);

  // Dynamic Banner Props
  const bannerTitle = categoryFilter ? categoryFilter : "Our Applications";
  const bannerDescription = categoryFilter 
    ? `Specialized applications within the ${categoryFilter} sector.`
    : "Precision solutions designed to meet the rigorous standards of international markets.";
  const breadcrumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Applications', href: '/applications' }
  ];
  if (categoryFilter) {
    breadcrumbs.push({ label: categoryFilter });
  }

  return (
    <>
      <PageBanner 
        title={bannerTitle} 
        description={bannerDescription}
        breadcrumbs={breadcrumbs}
        showBackButton={!!categoryFilter}
        backUrl="/applications"
        as="h1"
      />

      <section className="py-8 sm:py-14 md:py-20 px-[5px] sm:px-4">
        <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
          {loading ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-gray-50 border border-dashed border-gray-200">
              <Microscope className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-3 sm:mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No applications configured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {applications.map((app, idx) => (
                <FadeIn key={app._id} direction="up" delay={idx * 0.1}>
                  <div className="group bg-white flex flex-col h-full border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <Image 
                        src={app.image} 
                        alt={app.name} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-500" />
                    </div>
                    
                    <div className="p-5 sm:p-8 flex flex-col flex-1">
                      <h3 className="text-xl sm:text-2xl font-black text-secondary uppercase tracking-tight mb-2 sm:mb-4 group-hover:text-primary transition-colors leading-tight">
                        {app.name}
                      </h3>
                      <p className="text-gray-500 font-medium text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                        {app.description || 'Advanced testing solutions designed to meet the rigorous standards of this specialized industrial application.'}
                      </p>
                      
                      <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-50 flex items-center justify-between">
                        <Link 
                          href={`/products?application=${app.slug}`}
                          className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center group/link"
                        >
                          Explore Instruments 
                          <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function ApplicationsClient() {
  return (
    <Suspense fallback={
      <div className="text-center py-40">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Page Content...</p>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
