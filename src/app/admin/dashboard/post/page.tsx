'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

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

export default function PostJob() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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
        links: [{ link_title: 'Apply Online', url: '' }, { link_title: 'Notification PDF', url: '' }]
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleBasicChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'title' && !formData.slug) {
            setFormData(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleArrayChange = (section: keyof FormData, index: number, field: string, value: string) => {
        setFormData(prev => {
            const list = prev[section];
            if (!Array.isArray(list)) return prev;

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
            };
        });
    };

    const removeItem = (section: keyof FormData, index: number) => {
        setFormData(prev => {
            const list = prev[section];
            if (!Array.isArray(list)) return prev;
            return { ...prev, [section]: list.filter((_, i) => i !== index) };
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Insert Job
            const { data: job, error: jobError } = await supabase
                .from('jobs')
                .insert({
                    title: formData.title,
                    slug: formData.slug || generateSlug(formData.title),
                    organization: formData.organization,
                    brief_info: formData.brief_info,
                    total_vacancy: formData.total_vacancy,
                    job_type: formData.job_type,
                    is_featured: formData.is_featured
                })
                .select()
                .single();

            if (jobError) throw jobError;

            const jobId = job.id;

            // Relaxed type to accept Supabase PostgrestBuilder which is thenable but not strictly a Promise in TS eyes
            const throwOnError = async (promise: any) => {
                const { error } = await promise;
                if (error) throw error;
            };

            // 2. Insert Children (Dates, Fees, Vacancies, Links)
            const feesPayload = formData.fees.map((f, i) => ({ ...f, job_id: jobId, display_order: i + 1 }));
            const datesPayload = formData.dates.map((d, i) => ({ ...d, job_id: jobId, display_order: i + 1 }));
            const vacanciesPayload = formData.vacancies.map((v, i) => ({ ...v, job_id: jobId, display_order: i + 1 }));
            const linksPayload = formData.links.map((l, i) => ({ ...l, job_id: jobId, display_order: i + 1 }));

            await Promise.all([
                formData.fees[0].category_name ? throwOnError(supabase.from('job_fees').insert(feesPayload)) : Promise.resolve(),
                formData.dates[0].event_description ? throwOnError(supabase.from('job_dates').insert(datesPayload)) : Promise.resolve(),
                formData.vacancies[0].post_name ? throwOnError(supabase.from('job_vacancies').insert(vacanciesPayload)) : Promise.resolve(),
                formData.links[0].url ? throwOnError(supabase.from('job_links').insert(linksPayload)) : Promise.resolve(),
            ]);

            alert('Job Posted Successfully!');
            router.push('/admin/dashboard');

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert('Error: ' + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Post New Job</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>

                {/* Basic Info */}
                <div className={styles.section}>
                    <h3>Basic Details</h3>
                    <div className={styles.field}>
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleBasicChange} required placeholder="e.g. SBI SCO Recruitment 2025" />
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
                            <input name="total_vacancy" value={formData.total_vacancy} onChange={handleBasicChange} placeholder="e.g. 500+" />
                        </div>
                    </div>
                    <div className={styles.field} style={{ marginTop: '1rem' }}>
                        <label>Brief Info</label>
                        <textarea name="brief_info" rows={3} value={formData.brief_info} onChange={handleBasicChange} />
                    </div>
                </div>

                {/* Application Fees */}
                <div className={styles.section}>
                    <h3>Application Fees</h3>
                    {formData.fees.map((item, index) => (
                        <div key={index} className={styles.row}>
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Category (e.g. Gen/OBC)" value={item.category_name} onChange={(e) => handleArrayChange('fees', index, 'category_name', e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Amount (e.g. Rs. 100/-)" value={item.fee_amount} onChange={(e) => handleArrayChange('fees', index, 'fee_amount', e.target.value)} />
                            </div>
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
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Event (e.g. Start Date)" value={item.event_description} onChange={(e) => handleArrayChange('dates', index, 'event_description', e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Date (e.g. 05-01-2025)" value={item.event_date} onChange={(e) => handleArrayChange('dates', index, 'event_date', e.target.value)} />
                            </div>
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
                            <div className={styles.field} style={{ flex: 2 }}>
                                <input placeholder="Post Name" value={item.post_name} onChange={(e) => handleArrayChange('vacancies', index, 'post_name', e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Total" value={item.total_posts} onChange={(e) => handleArrayChange('vacancies', index, 'total_posts', e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ flex: 2 }}>
                                <input placeholder="Qualification" value={item.qualification} onChange={(e) => handleArrayChange('vacancies', index, 'qualification', e.target.value)} />
                            </div>
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
                            <div className={styles.field} style={{ flex: 1 }}>
                                <input placeholder="Link Title" value={item.link_title} onChange={(e) => handleArrayChange('links', index, 'link_title', e.target.value)} />
                            </div>
                            <div className={styles.field} style={{ flex: 2 }}>
                                <input placeholder="URL" value={item.url} onChange={(e) => handleArrayChange('links', index, 'url', e.target.value)} />
                            </div>
                            <button type="button" className={styles.removeBtn} onClick={() => removeItem('links', index)}>X</button>
                        </div>
                    ))}
                    <button type="button" className={styles.addBtn} onClick={() => addItem('links', { link_title: '', url: '' })}>+ Add Link</button>
                </div>

                <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                    {loading ? 'Posting...' : 'Publish Job'}
                </button>

            </form>
        </div>
    );
}

