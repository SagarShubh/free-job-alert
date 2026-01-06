import * as cheerio from 'cheerio';

export interface ScrapeResult {
    success: boolean;
    data?: {
        title: string;
        content: string; // Text content specifically targeted
        html: string;    // Full HTML if needed for debugging
    };
    error?: string;
}

/**
 * Fetches and parses a government job page.
 * Uses a fake User-Agent to avoid basic bot detection.
 */
export async function scrapeJobPage(url: string): Promise<ScrapeResult> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            },
            next: { revalidate: 0 } // Don't cache scraping requests
        });

        if (!response.ok) {
            return { success: false, error: `Failed to fetch: ${response.status} ${response.statusText}` };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and comments to clean up text
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove(); // Aggressive cleanup of boilerplate

        const title = $('h1').first().text().trim() || $('title').text().trim();
        // Get the main content - assuming semantic HTML or falling back to body
        // Adjust selectors based on specific government sites later
        const content = $('main').text().trim() || $('body').text().trim();

        // Whitespace cleanup
        const cleanContent = content.replace(/\s+/g, ' ').substring(0, 15000); // Limit to ~15k chars for token limits

        return {
            success: true,
            data: {
                title,
                content: cleanContent,
                html
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
