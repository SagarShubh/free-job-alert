'use client';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import styles from '../../post/page.module.css'; // Reusing styles

interface JobFee {
    category_name: string;
    fee_amount: string;
}

interface JobDate {
    event_description: string;
    event_date: string;
}

interface JobVacancy {
    post_name: string;
    total_posts: string;
    qualification: string;
}

interface JobLink {
    link_title: string;
    url: string;
}

interface FormData {
    title: string;
    slug: string;
    organization: string;
    brief_info: string;
    total_vacancy: string;
    job_type: string;
    is_featured: boolean;
    fees: JobFee[];
    dates: JobDate[];
    vacancies: JobVacancy[];
    links: JobLink[];
}

interface FetchedJob {
    id: string;
    title: string;
    slug: string;
    organization: string;
    brief_info: string | null;
    description: string | null; // Crawler fallback
    total_vacancy: string | null;
    job_type: string | null;
    is_featured: boolean;
    status: string;
    job_fees: JobFee[];
    job_dates: JobDate[];
    job_vacancies: JobVacancy[];
    job_links: JobLink[];
    application_fee: string | null; // Crawler fallback
    important_dates: string | unknown | null; // Crawler fallback (jsonb or string)
    important_links: string | unknown | null; // Crawler fallback (jsonb or string)
}

export default function EditJob() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Identical State Structure to PostJob
    const [formData, setFormData] = useState<FormData>({
        title: '',
        slug: '',
        organization: '',
        brief_info: '',
        total_vacancy: '',
        job_type: 'state',
        is_featured: false,
        fees: [{ category_name: '', fee_amount: '' }],
        dates: [{ event_description: '', event_date: '' }],
        vacancies: [{ post_name: '', total_posts: '', qualification: '' }],
        links: [{ link_title: 'Apply Online', url: '' }]
    });

    useEffect(() => {
        const fetchJob = async () => {
            // params is { id: string | string[] }
            const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

            if (!id) return;

            const { data: jobData, error } = await supabase
                .from('jobs')
                .select(`
                    *,
                    job_fees (category_name, fee_amount, display_order),
                    job_dates (event_description, event_date, display_order),
                    job_vacancies (post_name, total_posts, qualification, display_order),
                    job_links (link_title, url, display_order)
                `)
                .eq('id', id)
                .single();

            if (error || !jobData) {
                alert('Job not found');
                router.push('/admin/dashboard');
                return;
            }

            const job = jobData as unknown as FetchedJob;

            // Hydration Logic:
            let fees = job.job_fees?.length ? job.job_fees : [{ category_name: '', fee_amount: '' }];
            let dates = job.job_dates?.length ? job.job_dates : [{ event_description: '', event_date: '' }];
            let vacancies = job.job_vacancies?.length ? job.job_vacancies : [{ post_name: '', total_posts: '', qualification: '' }];
            let links = job.job_links?.length ? job.job_links : [{ link_title: 'Apply Online', url: '' }];

            // If important_links (JSON) exists from crawler
            if (job.status === 'draft' && !job.job_links?.length && job.important_links) {
                try {
                    const parsed = typeof job.important_links === 'string' ? JSON.parse(job.important_links) : job.important_links;
                    if (Array.isArray(parsed)) {
                        links = parsed.map((l: { title?: string; label?: string; url?: string }) => ({
                            link_title: l.title || l.label || 'Link',
                            url: l.url || ''
                        }));
                    }
                } catch {
                    // Ignore parse error
                }
            }

            // If important_dates (JSON) exists
            if (job.status === 'draft' && !job.job_dates?.length && job.important_dates) {
                try {
                    const parsed = typeof job.important_dates === 'string' ? JSON.parse(job.important_dates) : job.important_dates;
                    if (Array.isArray(parsed)) {
                        dates = parsed.map((d: { type?: string; date?: string }) => ({
                            event_description: d.type || 'Event',
                            event_date: d.date || ''
                        }));
                    }
                } catch {
                    // Ignore parse error
                }
            }

            setFormData({
                title: job.title || '',
                slug: job.slug || '',
                organization: job.organization || '',
                brief_info: job.brief_info || job.description || '', // Fallback to description from crawler
                total_vacancy: job.total_vacancy || '',
                job_type: job.job_type || 'state',
                is_featured: job.is_featured || false,
                fees,
                dates,
                vacancies,
                links
            });
            setLoading(false);
        };

        fetchJob();
    }, [params, router]);


    // --- Handlers (Copied from PostJob, adapted) ---
    const handleBasicChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (section: keyof FormData, index: number, field: string, value: string) => {
        setFormData(prev => {
            const list = prev[section];
            if (!Array.isArray(list)) return prev;

            // Allow mutation for deep update or prefer immutability:
            const updated = list.map((item, i) => i === index ? { ...item, [field]: value } : item);
            return { ...prev, [section]: updated };
        });
    };

    const addItem = (section: keyof FormData, template: JobFee | JobDate | JobVacancy | JobLink) => {
        setFormData(prev => {
            const list = prev[section];
            if (!Array.isArray(list)) return prev;
            return {
                ...prev,
                [section]: [...list, template]
            } as FormData; // Helper to satisfy TS
        });
    };

    const removeItem = (section: keyof FormData, index: number) => {
        setFormData(prev => {
            const list = prev[section];
            if (!Array.isArray(list)) return prev;
            return { ...prev, [section]: list.filter((_, i) => i !== index) };
        });
    };

    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

        try {
            // 1. Update Main Job
            const { error: jobError } = await supabase
                .from('jobs')
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    organization: formData.organization,
                    brief_info: formData.brief_info,
                    total_vacancy: formData.total_vacancy,
                    job_type: formData.job_type,
                    is_featured: formData.is_featured,
                    status: 'published' // PUBLISH!
                })
                .eq('id', id);

            if (jobError) throw jobError;

            // 2. Nuke and Re-insert Children (Easiest way to handle edits)
            await Promise.all([
                supabase.from('job_fees').delete().eq('job_id', id),
                supabase.from('job_dates').delete().eq('job_id', id),
                supabase.from('job_vacancies').delete().eq('job_id', id),
                supabase.from('job_links').delete().eq('job_id', id),
            ]);

            // 3. Insert fresh children
            const feesPayload = formData.fees.filter(f => f.category_name).map((f, i) => ({ ...f, job_id: id, display_order: i + 1 }));
            const datesPayload = formData.dates.filter(d => d.event_description).map((d, i) => ({ ...d, job_id: id, display_order: i + 1 }));
            const vacanciesPayload = formData.vacancies.filter(v => v.post_name).map((v, i) => ({ ...v, job_id: id, display_order: i + 1 }));
            const linksPayload = formData.links.filter(l => l.url).map((l, i) => ({ ...l, job_id: id, display_order: i + 1 }));

            await Promise.all([
                feesPayload.length && supabase.from('job_fees').insert(feesPayload),
                datesPayload.length && supabase.from('job_dates').insert(datesPayload),
                vacanciesPayload.length && supabase.from('job_vacancies').insert(vacanciesPayload),
                linksPayload.length && supabase.from('job_links').insert(linksPayload),
            ]);

            alert('Job Published Successfully! 🚀');
            router.push('/admin/dashboard');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Error: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Job...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Review & Publish Draft</h1>
            </header>

            <form onSubmit={handlePublish} className={styles.form}>
                {/* Basic Info */}
                <div className={styles.section}>
                    <h3>Basic Details</h3>
                    <div className={styles.field}>
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleBasicChange} required />
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label>Slug (URL)</label>
                            <input name="slug" value={formData.slug} onChange={handleBasicChange} required />
                        </div>
                        <div className={styles.field}>
                            <label>Organization</label>
                            <input name="organization" value={formData.organization} onChange={handleBasicChange} required />
                        </div>
                    </div>
                    <div className={styles.grid} style={{ marginTop: '1rem' }}>
                        <div className={styles.field}>
                            <label>Job Type</label>
                            <select name="job_type" value={formData.job_type} onChange={handleBasicChange}>
                                <option value="state">State Govt</option>
                                <option value="central">Central Govt</option>
                                <option value="bank">Bank</option>
                                <option value="teaching">Teaching</option>
                                <option value="engineering">Engineering</option>
                                <option value="police">Police/Defence</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Total Vacancy</label>
                            <input name="total_vacancy" value={formData.total_vacancy} onChange={handleBasicChange} />
                        </div>
                    </div>
                    <div className={styles.field} style={{ marginTop: '1rem' }}>
                        <label>Brief Info (Markdown supported)</label>
                        <textarea name="brief_info" rows={5} value={formData.brief_info} onChange={handleBasicChange} />
                    </div>
                </div>

                {/* Application Fees */}
                <div className={styles.section}>
                    <h3>Application Fees</h3>
                    {formData.fees.map((item, index) => (
                        <div key={index} className={styles.row}>
                            <input placeholder="Category" value={item.category_name} onChange={(e) => handleArrayChange('fees', index, 'category_name', e.target.value)} style={{ flex: 1 }} />
                            <input placeholder="Amount" value={item.fee_amount} onChange={(e) => handleArrayChange('fees', index, 'fee_amount', e.target.value)} style={{ flex: 1 }} />
                            <button type="button" className={styles.removeBtn} onClick={() => removeItem('fees', index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem('fees', { category_name: '', fee_amount: '' })}>+ Add Fee</button>
                </div>

                {/* Important Dates */}
                <div className={styles.section}>
                    <h3>Important Dates</h3>
                    {formData.dates.map((item, index) => (
                        <div key={index} className={styles.row}>
                            <input placeholder="Event" value={item.event_description} onChange={(e) => handleArrayChange('dates', index, 'event_description', e.target.value)} style={{ flex: 1 }} />
                            <input placeholder="Date" value={item.event_date} onChange={(e) => handleArrayChange('dates', index, 'event_date', e.target.value)} style={{ flex: 1 }} />
                            <button type="button" className={styles.removeBtn} onClick={() => removeItem('dates', index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem('dates', { event_description: '', event_date: '' })}>+ Add Date</button>
                </div>

                {/* Vacancies */}
                <div className={styles.section}>
                    <h3>Vacancy Details</h3>
                    {formData.vacancies.map((item, index) => (
                        <div key={index} className={styles.row}>
                            <input placeholder="Post Name" value={item.post_name} onChange={(e) => handleArrayChange('vacancies', index, 'post_name', e.target.value)} style={{ flex: 2 }} />
                            <input placeholder="Total" value={item.total_posts} onChange={(e) => handleArrayChange('vacancies', index, 'total_posts', e.target.value)} style={{ flex: 1 }} />
                            <input placeholder="Qualification" value={item.qualification} onChange={(e) => handleArrayChange('vacancies', index, 'qualification', e.target.value)} style={{ flex: 2 }} />
                            <button type="button" className={styles.removeBtn} onClick={() => removeItem('vacancies', index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem('vacancies', { post_name: '', total_posts: '', qualification: '' })}>+ Add Vacancy</button>
                </div>

                {/* Links */}
                <div className={styles.section}>
                    <h3>Important Links</h3>
                    {formData.links.map((item, index) => (
                        <div key={index} className={styles.row}>
                            <input placeholder="Title" value={item.link_title} onChange={(e) => handleArrayChange('links', index, 'link_title', e.target.value)} style={{ flex: 1 }} />
                            <input placeholder="URL" value={item.url} onChange={(e) => handleArrayChange('links', index, 'url', e.target.value)} style={{ flex: 2 }} />
                            <button type="button" className={styles.removeBtn} onClick={() => removeItem('links', index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem('links', { link_title: '', url: '' })}>+ Add Link</button>
                </div>

                <button type="submit" disabled={saving} className={`btn btn-primary ${styles.submitBtn}`}>
                    {saving ? 'Publishing...' : '✅ Publish Live'}
                </button>
            </form>
        </div>
    );
}

