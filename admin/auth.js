const SUPABASE_URL='https://sykrarmpxorjdwglgftq.supabase.co';
const SUPABASE_ANON_KEY='sb_publishable_kXF-MxD6dZhOw3qJNSSqeg__Z7KUT26';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

async function requireAuth(){
  const {data:{session}}=await db.auth.getSession();
  if(!session){window.location.href='../index.html';return null;}
  const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aal?.currentLevel!=='aal2'&&aal?.nextLevel==='aal2'){
    window.location.href='../index.html';
    return null;
  }
  const {data:adminRow}=await db.from('admins').select('uid').eq('user_id',session.user.id).maybeSingle();
  if(!adminRow){await db.auth.signOut();window.location.href='../index.html';return null;}
  return session;
}

async function logout(){
  await db.auth.signOut();
  window.location.href='../index.html';
}

function toast(msg,type='success'){
  const c=document.getElementById('toastContainer');
  if(!c){alert(msg);return;}
  const el=document.createElement('div');
  el.className='toast '+type;
  el.innerHTML=(type==='success'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>')+'<span>'+String(msg).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</span>';
  c.appendChild(el);
  setTimeout(()=>{el.classList.add('hiding');setTimeout(()=>el.remove(),300);},3500);
}

async function open2FASettings(){
  const {data:factors}=await db.auth.mfa.listFactors();
  if(factors?.totp?.length>0){
    const factor=factors.totp[0];
    if(factor.status!=='verified'){
      toast('2FA не подтверждён. Удали его в Supabase Dashboard → Authentication → Users → MFA factors','error');
      return;
    }
    if(!confirm('2FA включён. Отключить?'))return;
    const {error}=await db.auth.mfa.unenroll({factorId:factor.id});
    if(error){toast(error.message,'error');return;}
    toast('2FA отключён');
    return;
  }
  const {data,error}=await db.auth.mfa.enroll({factorType:'totp'});
  if(error){toast(error.message,'error');return;}
  window.__pendingFactorId=data.id;
  const modal=document.getElementById('twofaModal');
  const content=document.getElementById('twofaContent');
  if(!modal||!content){alert('Модалка 2FA не найдена');return;}
  content.innerHTML=`
    <h2 style="margin-bottom:16px;">Настройка 2FA</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:20px;">Отсканируй QR в Google Authenticator, затем введи 6 цифр.</p>
    <div style="text-align:center;margin-bottom:16px;"><img src="${data.totp.qr_code}" style="width:200px;height:200px;"></div>
    <div style="font-family:monospace;font-size:12px;color:var(--muted);padding:12px;background:var(--soft);border-radius:var(--radius-sm);margin-bottom:20px;word-break:break-all;text-align:center;">${data.totp.secret}</div>
    <form onsubmit="confirm2FA(event)">
      <div class="form-group"><label>Код из приложения</label><input type="text" id="twofaSetupCode" maxlength="6" inputmode="numeric" required style="font-size:24px;letter-spacing:8px;text-align:center;font-weight:800;" placeholder="000000"></div>
      <button type="submit" class="submit-btn primary" style="max-width:none;">Включить 2FA</button>
    </form>`;
  modal.classList.add('open');
}

async function confirm2FA(e){
  e.preventDefault();
  const code=document.getElementById('twofaSetupCode').value.trim();
  const factorId=window.__pendingFactorId;
  try{
    const {data:challenge,error:chErr}=await db.auth.mfa.challenge({factorId});
    if(chErr)throw chErr;
    const {error:vErr}=await db.auth.mfa.verify({factorId,challengeId:challenge.id,code});
    if(vErr)throw new Error('Неверный код');
    toast('2FA включён ✅');
    document.getElementById('twofaModal').classList.remove('open');
    window.__pendingFactorId=null;
  }catch(err){toast(err.message,'error');}
}
