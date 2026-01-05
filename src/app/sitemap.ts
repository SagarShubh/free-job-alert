import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = 'https://free-job-alert-ten.vercel.app'; // Replace with actual production URL if different

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const routes = [
        '',
        '/all-india',
        '/state',
        '/bank',
        '/teaching',
        '/engineering',
        '/defence',
        '/railway',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Dynamic Job Routes
    const { data: jobs } = await supabase
        .from('jobs')
        .select('slug, update_date, post_date');

    const jobRoutes = (jobs || []).map((job) => ({
        url: `${BASE_URL}/jobs/${job.slug}`,
        lastModified: new Date(job.update_date || job.post_date),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...jobRoutes];
}
