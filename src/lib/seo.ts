import dbConnect from './dbConnect';
import PageMeta from '@/models/PageMeta';
import { Metadata } from 'next';

export async function getPageMetadata(pageKey: string): Promise<Metadata> {
  const defaultTitle = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
  const brandSuffix = '| LabZenix';

  try {
    await dbConnect();
    const meta = await PageMeta.findOne({ pageKey });
    
    if (!meta) {
      return {
        title: `${defaultTitle} ${brandSuffix}`,
      };
    }

    return {
      title: `${meta.metaTitle} ${brandSuffix}`,
      description: meta.metaDescription,
      keywords: meta.focusKeyword ? [meta.focusKeyword, ...meta.keywords] : meta.keywords,
      openGraph: {
        title: meta.ogTitle ? `${meta.ogTitle} ${brandSuffix}` : `${meta.metaTitle} ${brandSuffix}`,
        description: meta.ogDescription || meta.metaDescription,
      }
    };
  } catch (error) {
    return {
      title: `${defaultTitle} ${brandSuffix}`,
    };
  }
}
