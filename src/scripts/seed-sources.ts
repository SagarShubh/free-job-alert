import './setup-env';
import { supabaseAdmin } from '../lib/supabaseAdmin';

async function seed() {
    console.log('--- Seeding Massive Source List ---');

    const sources = [
        // --- CENTRAL AGENCIES ---
        { name: 'UPSC Advertisements', url: 'https://upsc.gov.in/advertisement/vacancy-circular-2024', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'SSC Notices', url: 'https://ssc.nic.in/Portal/Notices', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'Railway Board (RRB)', url: 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,4,1244', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'DRDO Recruitment', url: 'https://www.drdo.gov.in/careers', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'ISRO Careers', url: 'https://www.isro.gov.in/Careers.html', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'India Post', url: 'https://www.indiapost.gov.in/VAS/Pages/Content/Recruitments.aspx', target_type: 'job', status: 'active', region: 'All India' },

        // --- BANKING & INSURANCE ---
        { name: 'IBPS Home', url: 'https://ibps.in', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'SBI Careers', url: 'https://sbi.co.in/web/careers', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'RBI Opportunities', url: 'https://opportunities.rbi.org.in/scripts/Vacancies.aspx', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'LIC Recruitment', url: 'https://licindia.in/bottom-links/careers/recruitment-of-assistants-2024', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'NABARD Careers', url: 'https://www.nabard.org/careers-notices1.aspx?cid=693&id=26', target_type: 'job', status: 'active', region: 'All India' },

        // --- DEFENCE & POLICE ---
        { name: 'Join Indian Army', url: 'https://joinindianarmy.nic.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'Indian Navy', url: 'https://www.joinindiannavy.gov.in/en/account/login', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'Indian Air Force', url: 'https://afcat.cdac.in/AFCAT/', target_type: 'job', status: 'active', region: 'All India' },

        // --- STATE PSCs (NORTH) ---
        { name: 'UPPSC (Uttar Pradesh)', url: 'https://uppsc.up.nic.in/', target_type: 'job', status: 'active', region: 'UP' },
        { name: 'UPSSSC (Uttar Pradesh)', url: 'http://upsssc.gov.in/', target_type: 'job', status: 'active', region: 'UP' },
        { name: 'BPSC (Bihar)', url: 'https://www.bpsc.bih.nic.in/', target_type: 'job', status: 'active', region: 'BR' },
        { name: 'UKPSC (Uttarakhand)', url: 'https://psc.uk.gov.in/', target_type: 'job', status: 'active', region: 'UK' },
        { name: 'HPSC (Haryana)', url: 'http://hpsc.gov.in/en-us/', target_type: 'job', status: 'active', region: 'HR' },
        { name: 'HSSC (Haryana)', url: 'https://www.hssc.gov.in/', target_type: 'job', status: 'active', region: 'HR' },
        { name: 'PPSC (Punjab)', url: 'https://ppsc.gov.in/', target_type: 'job', status: 'active', region: 'PB' },
        { name: 'RPSC (Rajasthan)', url: 'https://rpsc.rajasthan.gov.in/', target_type: 'job', status: 'active', region: 'RJ' },
        { name: 'RSMSSB (Rajasthan)', url: 'https://rsmssb.rajasthan.gov.in/', target_type: 'job', status: 'active', region: 'RJ' },
        { name: 'MPPSC (Madhya Pradesh)', url: 'https://mppsc.mp.gov.in/', target_type: 'job', status: 'active', region: 'MP' },
        { name: 'CGPSC (Chhattisgarh)', url: 'http://psc.cg.gov.in/', target_type: 'job', status: 'active', region: 'CG' },

        // --- STATE PSCs (SOUTH) ---
        { name: 'APPSC (Andhra Pradesh)', url: 'https://psc.ap.gov.in/', target_type: 'job', status: 'active', region: 'AP' },
        { name: 'TSPSC (Telangana)', url: 'https://www.tspsc.gov.in/', target_type: 'job', status: 'active', region: 'TS' },
        { name: 'TNPSC (Tamil Nadu)', url: 'https://www.tnpsc.gov.in/', target_type: 'job', status: 'active', region: 'TN' },
        { name: 'KPSC (Karnataka)', url: 'https://kpsc.kar.nic.in/', target_type: 'job', status: 'active', region: 'KA' },
        { name: 'Kerala PSC', url: 'https://www.keralapsc.gov.in/', target_type: 'job', status: 'active', region: 'KL' },

        // --- STATE PSCs (EAST/WEST) ---
        { name: 'WBPSC (West Bengal)', url: 'https://psc.wb.gov.in/', target_type: 'job', status: 'active', region: 'WB' },
        { name: 'JPSC (Jharkhand)', url: 'https://www.jpsc.gov.in/', target_type: 'job', status: 'active', region: 'JH' },
        { name: 'OPSC (Odisha)', url: 'https://www.opsc.gov.in/', target_type: 'job', status: 'active', region: 'OD' },
        { name: 'MPSC (Maharashtra)', url: 'https://mpsc.gov.in/', target_type: 'job', status: 'active', region: 'MH' },
        { name: 'GPSC (Gujarat)', url: 'https://gpsc.gujarat.gov.in/', target_type: 'job', status: 'active', region: 'GJ' },

        // --- RESULTS & ADMIT CARDS SPECIFIC ---
        { name: 'Sarkari Result', url: 'https://www.sarkariresult.com/', target_type: 'job', status: 'active', region: 'All India' }, // Good meta-source
        { name: 'UPSC Written Results', url: 'https://upsc.gov.in/written-results', target_type: 'result', status: 'active', region: 'All India' },
        { name: 'UPSC Admit Cards', url: 'https://upsc.gov.in/e-admit-cards', target_type: 'admit_card', status: 'active', region: 'All India' },
        { name: 'SSC Admit Cards', url: 'https://ssc.nic.in/Portal/AdmitCard', target_type: 'admit_card', status: 'active', region: 'All India' },
        { name: 'SSC Results', url: 'https://ssc.nic.in/Portal/Results', target_type: 'result', status: 'active', region: 'All India' },
        { name: 'RRB Results', url: 'https://www.rrbcdg.gov.in/', target_type: 'result', status: 'active', region: 'All India' },
        { name: 'RRB Admit Cards', url: 'https://www.rrbcdg.gov.in/', target_type: 'admit_card', status: 'active', region: 'All India' },

        // --- PSUs (Public Sector Undertakings) ---
        { name: 'ONGC Recruitment', url: 'https://ongcindia.com/web/eng/career/recruitment-notice', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'NTPC Careers', url: 'https://careers.ntpc.co.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'BHEL Careers', url: 'https://careers.bhel.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'IOCL Careers', url: 'https://iocl.com/latest-job-openings', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'SAIL Careers', url: 'https://sail.co.in/en/career-opportunities', target_type: 'job', status: 'active', region: 'All India' },

        // --- TEACHING & EDUCATION ---
        { name: 'CTET', url: 'https://ctet.nic.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'KVS (Kendriya Vidyalaya)', url: 'https://kvsangathan.nic.in/employment-notice/vacancies/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'NVS (Navodaya Vidyalaya)', url: 'https://navodaya.gov.in/nvs/en/Recruitment/Notification-Vacancies/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'UGC NET', url: 'https://ugcnet.nta.nic.in/', target_type: 'job', status: 'active', region: 'All India' },

        // --- JUDICIARY & COURTS ---
        { name: 'Supreme Court of India', url: 'https://main.sci.gov.in/recruitment', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'Delhi High Court', url: 'https://delhihighcourt.nic.in/public/recruitment-result', target_type: 'job', status: 'active', region: 'DL' },

        // --- ADMISSION & ENTRANCE EXAMS ---
        { name: 'NTA Exams (NEET/JEE)', url: 'https://nta.ac.in/NoticeBoardArchive', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'JEE Main', url: 'https://jeemain.nta.nic.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'NEET UG', url: 'https://neet.nta.nic.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'CLAT Consortium', url: 'https://consortiumofnlus.ac.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'IGNOU Admission', url: 'http://ignou.ac.in/ignou/studentzone/adminssionanouncement', target_type: 'job', status: 'active', region: 'All India' },

        // --- SYLLABUS & ANSWER KEYS (Meta-sources) ---
        // Note: Direct syllabus/key links are hard to track, we often track the main notice board.
        // But we can add specific boards known for releasing keys.
        { name: 'CBSE Academic', url: 'https://cbseacademic.nic.in/', target_type: 'job', status: 'active', region: 'All India' },
        { name: 'MP PEB (Vyapam)', url: 'http://peb.mp.gov.in/e_default.html', target_type: 'job', status: 'active', region: 'MP' }, // Famous for Answer Keys/Results
        { name: 'UP Police Board', url: 'http://uppbpb.gov.in/', target_type: 'job', status: 'active', region: 'UP' } // Huge traffic source
    ];

    for (const source of sources) {
        // Warning: This ignores 'region' if not in schema yet, but safe to pass if using strict casting or partial
        // We need to verify if 'region' exists in DB. If not, we skip it or add it.
        // For now, let's keep it simple and just use the fields we know exist or are ignored.

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ...dbSource } = source; // Keep region!

        const { error } = await supabaseAdmin
            .from('sources')
            .upsert(dbSource, { onConflict: 'url' });

        if (error) console.error(`Failed to seed ${source.name}:`, error.message);
        else console.log(`✅ Seeded: ${source.name}`);
    }

    console.log(`--- Seeding Complete: ${sources.length} Sources ---`);
}

seed().catch(console.error);
