import {describe,it,expect} from 'vitest';
import Database from 'better-sqlite3';
import {ensureVisitor,visitorHash,publicProject,createPublicQuota,csvCell} from './publicAccess.js';
import {createProjectSchema,reprojectSchema,keywordQuerySchema,mergeAssumptions,DEFAULT_ASSUMPTIONS} from '../utils/validators.js';
import {createAnalysisGuard} from './analysisGuard.js';
const req=(token=''):any=>({headers:{cookie:token?'appraisal_visitor='+token:''}});
describe('public calculator security',()=>{
  it('issues opaque HttpOnly secure browser ownership without a shared admin secret',()=>{
    let token='',options:any;
    const response:any={cookie(_name:string,value:string,opts:any){token=value;options=opts;}};
    const owner=ensureVisitor(req(),response,true);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(options).toMatchObject({httpOnly:true,secure:true,sameSite:'strict'});
    expect(visitorHash(req(token))).toBe(owner);
    expect(visitorHash(req('forged'))).toBe(null);
    expect(ensureVisitor(req(token),response,true)).toBe(owner);
    const visible=publicProject({id:'x',owner_hash:owner,error_message:'secret error detail'},req(token));
    expect(visible.can_edit).toBe(true);expect(visible).not.toHaveProperty('owner_hash');
    expect(visible.error_message).not.toContain('secret');
    expect(publicProject({owner_hash:owner},req()).can_edit).toBe(false);
    expect(publicProject({owner_hash:null},req(token)).can_edit).toBe(false);
  });
  it('enforces persistent creation limits across cookies, deletion and quota instances',()=>{
    const db=new Database(':memory:');
    try{
      db.exec('CREATE TABLE projects(id TEXT)');
      const limits={global:3,perClient:1,stored:10};
      const q=createPublicQuota(db,limits);
      expect(q.claim('owner-1','ip-1')).toBe(true);
      expect(q.claim('new-cookie','ip-1')).toBe(false);
      expect(q.claim('owner-1','new-ip')).toBe(false);
      expect(createPublicQuota(db,limits).claim('owner-2','ip-2')).toBe(true);
      expect(q.claim('owner-3','ip-3')).toBe(true);
      db.exec('DELETE FROM projects');
      expect(q.claim('owner-4','ip-4')).toBe(false);
    }finally{db.close();}
  });
  it('rejects new projects at the persistent storage cap',()=>{
    const db=new Database(':memory:');try{
      db.exec("CREATE TABLE projects(id TEXT);INSERT INTO projects VALUES('existing')");
      expect(createPublicQuota(db,{global:10,perClient:10,stored:1}).claim('a','b')).toBe(false);
    }finally{db.close();}
  });
  it('rejects HTML, whitespace, oversized strings, invalid locales and unexpected fields',()=>{
    for(const data of [{seed_keyword:' '},{seed_keyword:'<img src=x onerror=alert(1)>'},{seed_keyword:'x\ny'},
      {seed_keyword:'x'.repeat(201)},{seed_keyword:'ok',locale_country:'../etc'},
      {seed_keyword:'ok',locale_language:'../../x'},{seed_keyword:'ok',currency_display:['USD','USD']},
      {seed_keyword:'ok',owner_hash:'injected'},{seed_keyword:'ok',assumptions:{unknown:1}}])
      expect(createProjectSchema.safeParse(data).success).toBe(false);
    expect(createProjectSchema.parse({seed_keyword:"  shoes ' OR 1=1 --  "}).seed_keyword).toBe("shoes ' OR 1=1 --");
    expect(createProjectSchema.parse({seed_keyword:'shoes',locale_country:'us'}).locale_country).toBe('US');
  });
  it('rejects non-finite/overflowing values and deeply merges bounded assumptions',()=>{
    for(const amount of [Infinity,NaN,-1,1e20]) expect(reprojectSchema.safeParse({assumptions:{value_per_sale:{amount,currency:'USD'}}}).success).toBe(false);
    const merged=mergeAssumptions(DEFAULT_ASSUMPTIONS,{conversion_rate_multiplier:{commercial:0.2}});
    expect(merged.conversion_rate_multiplier.transactional).toBe(1);
    expect(merged.conversion_rate_multiplier.commercial).toBe(0.2);
    expect(keywordQuerySchema.safeParse({sort:'keyword; DROP TABLE projects'}).success).toBe(false);
    expect(keywordQuerySchema.safeParse({intent:['commercial','transactional']}).success).toBe(false);
  });
  it('prevents spreadsheet formulas and correctly escapes CSV cells',()=>{
    expect(csvCell('a"b,c')).toBe('"a""b,c"');
    for(const value of ['=1+1','+cmd','-cmd','@SUM(A1)',' \t=HYPERLINK("x")'])expect(csvCell(value).startsWith('"\'')).toBe(true);
  });
  it('persists per-client analysis claims and does not let cookie cycling bypass daily limits',()=>{
    const db=new Database(':memory:');try{
      db.exec('CREATE TABLE analysis_claims(project_id TEXT NOT NULL,day TEXT NOT NULL,PRIMARY KEY(project_id,day))');
      const guard=createAnalysisGuard(db,3,1,1);
      expect(guard.claim('a','ip-1')).toBe(true);
      expect(guard.claim('b','ip-2')).toBe(false);
      guard.release();
      const restarted=createAnalysisGuard(db,3,1,1);
      expect(restarted.claim('b','ip-1')).toBe(false);
      expect(restarted.claim('a','ip-2')).toBe(false);
      expect(restarted.claim('b','ip-2')).toBe(true);restarted.release();
      expect(restarted.claim('c','ip-3')).toBe(true);restarted.release();
      expect(restarted.claim('d','ip-4')).toBe(false);
    }finally{db.close();}
  });
});
