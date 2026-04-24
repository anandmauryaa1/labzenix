import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white">
      <div className="max-w-xl w-full text-center space-y-12">
        <div className="relative">
          <h1 className="text-[180px] font-black text-gray-50 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl font-black text-secondary tracking-tighter uppercase italic">Asset Not Found</h2>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-500 font-medium max-w-sm mx-auto">
            The resource you are looking for has been decommissioned or relocated within our digital infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/products" 
            className="group flex items-center justify-between p-6 bg-gray-50 border border-gray-100 hover:border-primary transition-all text-left"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Catalog</p>
              <p className="text-sm font-bold text-secondary">Browse Products</p>
            </div>
            <Search className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>

          <Link 
            href="/" 
            className="group flex items-center justify-between p-6 bg-gray-50 border border-gray-100 hover:border-primary transition-all text-left"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Navigation</p>
              <p className="text-sm font-bold text-secondary">Back to Control</p>
            </div>
            <Home className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <div className="pt-8">
          <Link 
            href="/contact"
            className="inline-flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.3em] text-secondary hover:text-primary transition-colors"
          >
            <span>Report Technical Issue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
