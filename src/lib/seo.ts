import dbConnect from './dbConnect';
import PageMeta from '@/models/PageMeta';
import { Metadata } from 'next';

export async function getPageMetadata(pageKey: string): Promise<Metadata> {
  try {
    await dbConnect();
    const meta = await PageMeta.findOne({ pageKey });
    
    if (!meta) return {};

    return {
      title: meta.metaTitle,
      description: meta.metaDescription,
      keywords: meta.keywords,
      openGraph: {
        title: meta.metaTitle,
        description: meta.metaDescription,
      }
    };
  } catch (error) {
    return {};
  }
}
