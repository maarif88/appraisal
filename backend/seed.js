const API_BASE = 'http://localhost:3100/api/v1';

async function seed() {
  console.log('[*] Fetching available crawled keywords from API...');
  try {
    const listRes = await fetch(`${API_BASE}/projects/crawled-keywords`);
    if (!listRes.ok) throw new Error(await listRes.text());
    const { keywords } = await listRes.json();
    
    console.log(`[SUCCESS] Found ${keywords.length} crawled keywords to seed.`);
    
    // Fetch existing projects to avoid duplicates
    const projRes = await fetch(`${API_BASE}/projects`);
    const { projects: existingProjects } = await projRes.json();
    const existingSeeds = new Set(existingProjects.map(p => p.seed_keyword.toLowerCase().trim()));
    
    for (const kwItem of keywords) {
      const kw = kwItem.keyword;
      if (existingSeeds.has(kw.toLowerCase().trim())) {
        console.log(`[-] Project for "${kw}" already exists. Skipping.`);
        continue;
      }
      
      console.log(`[*] Creating project for "${kw}" (Sector: ${kwItem.sector})...`);
      const createRes = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seed_keyword: kw,
          locale_country: kwItem.location,
          locale_language: kwItem.lang.toLowerCase() === 'indonesian' ? 'id' : 'en',
          currency_base: 'USD',
          currency_display: ['USD', 'IDR'],
          sector: kwItem.sector,
          assumptions: {
            capture_rate_target_pct: kwItem.sector === 'Banking' ? 8.0 : 9.5,
            conversion_rate_pct: 3.0,
            value_per_sale: { amount: kwItem.sector === 'Banking' ? 250 : 350, currency: 'USD' },
            ramp_up_months_to_target: kwItem.sector === 'Banking' ? 10 : 9,
            service_fee_pct: kwItem.sector === 'Banking' ? 30 : 20,
            overlap_discount_factor: kwItem.sector === 'Banking' ? 0.15 : 0.14
          }
        })
      });
      
      if (!createRes.ok) {
        console.log(`[!] Failed to create project for "${kw}":`, await createRes.text());
        continue;
      }
      
      const project = await createRes.json();
      console.log(`[SUCCESS] Created project ID: ${project.id}. Starting analysis pipeline...`);
      
      const analyzeRes = await fetch(`${API_BASE}/projects/${project.id}/analyze`, { method: 'POST' });
      if (analyzeRes.ok) {
        console.log(`[SUCCESS] Pipeline started for "${kw}".`);
      } else {
        console.log(`[!] Failed to start pipeline for "${kw}":`, await analyzeRes.text());
      }
      
      // Small delay for clean SQLite transactions
      await new Promise(r => setTimeout(r, 600));
    }
    
    console.log('\n[SUCCESS] Seeding completed successfully!');
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
  }
}

seed();
