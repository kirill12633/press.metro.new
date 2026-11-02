const SUPABASE_URL='https://sykrarmpxorjdwglgftq.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_kXF-MxD6dZhOw3qJNSSqeg__Z7KUT26';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

// Проверка: если 2FA не пройден — редирект на вход
async function requireAuth(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){window.location.href='index.html';return null;}
  const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal?.currentLevel!=='aal2'&&aal?.nextLevel==='aal2'){
    // 2FA включён, но не пройден
    window.location.href='index.html';
    return null;
  }
  const {data:adminRow}=await db.from('admins').select('uid').eq('user_id',session.user.id).maybeSingle();
  if(!adminRow){await db.auth.signOut();window.location.href='index.html';return null;}
  return session;
}

// Проверка 2FA на главной (после пароля)
async function check2FA(){
  const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
  return aal?.currentLevel==='aal2'||aal?.nextLevel!=='aal2';
}
