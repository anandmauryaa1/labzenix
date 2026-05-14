import { getPageMetadata } from '@/lib/seo';
import ApplicationsClient from './ApplicationsClient';

export async function generateMetadata() {
  return await getPageMetadata('applications');
}

export default function ApplicationsPage() {
  return (
    <div className="bg-white min-h-screen">
      <ApplicationsClient />
    </div>
  );
}
