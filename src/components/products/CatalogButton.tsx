'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import CatalogDownloadModal from './CatalogDownloadModal';

interface CatalogButtonProps {
  productName: string;
  productId: string;
  catalogUrl: string;
}

export default function CatalogButton({ productName, productId, catalogUrl }: CatalogButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center px-8 py-4 border-2 border-secondary text-secondary font-black uppercase tracking-widest text-sm hover:bg-secondary hover:text-white transition-all active:scale-95 flex-1 sm:flex-none"
      >
        <Download className="w-4 h-4 mr-2" />
        <span>Download Catalog</span>
      </button>

      <CatalogDownloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        productName={productName}
        productId={productId}
        catalogUrl={catalogUrl}
      />
    </>
  );
}
