(() => {
  const KEY='wicho-home-admin-v2';
  const AUTH_KEY='wicho-home-admin-auth-v1';
  const CRED_KEY='wicho-home-admin-cred-v1';
  const AUTH_USER='wichonemes@gmail.com';
  const AUTH_HASH='23386e953632d44adfdd3cb6f9e76c58193e4e48026ff3dd39385c1ede42b9f5';
  const slots={
    'hero-cover':'Portada superior', 'profile-photo':'Foto de perfil', 'logo-site':'Logo junto a Wicho Nemes',
    'area-identidad':'Identidad corporativa', 'area-audiovisual':'Audiovisual', 'area-animacion':'Animación', 'area-ilustracion':'Ilustración',
    'area-modelado':'Modelado 3D', 'area-ux':'Diseño de interfaces', 'area-impresos':'Medios impresos', 'area-editorial':'Diseño editorial',
    'project-artesano':'Imagen o logo · Artesano Digital', 'project-civil':'Imagen o logo · Civil Armory', 'project-popol':'Imagen o logo · Popol Vuh', 'project-cafe':'Imagen o logo · Café San Luis'
  };
  const groups={
    'Portada e identidad':['hero-cover','profile-photo','logo-site'],
    'Portadas de cada área':['area-identidad','area-audiovisual','area-animacion','area-ilustracion','area-modelado','area-ux','area-impresos','area-editorial'],
    'Imágenes de proyectos destacados':['project-artesano','project-civil','project-popol','project-cafe']
  };
  const panel=document.getElementById('adminPanel'), backdrop=document.getElementById('adminBackdrop'), toggle=document.getElementById('adminToggle'), status=document.getElementById('adminStatus');
  const login=document.getElementById('adminLogin'), loginForm=document.getElementById('adminLoginForm'), loginUser=document.getElementById('adminUser'), loginPass=document.getElementById('adminPass'), loginError=document.getElementById('adminLoginError'), loginClose=document.getElementById('adminLoginClose'), loginSubmit=document.getElementById('adminLoginSubmit'), logout=document.getElementById('adminLogout');
  const forgot=document.getElementById('adminForgot'), recovery=document.getElementById('adminRecovery'), recoveryBack=document.getElementById('adminRecoveryBack'), resetLocal=document.getElementById('adminResetLocal');
  const changeForm=document.getElementById('changePasswordForm'), currentPassword=document.getElementById('currentPassword'), newPassword=document.getElementById('newPassword'), confirmPassword=document.getElementById('confirmPassword'), changeStatus=document.getElementById('changePasswordStatus');
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{saved={}}
  let authed=false;
  try{authed=sessionStorage.getItem(AUTH_KEY)==='1'}catch{}
  function setAuth(value){
    authed=value;
    try{value?sessionStorage.setItem(AUTH_KEY,'1'):sessionStorage.removeItem(AUTH_KEY)}catch{}
  }
  function bytesToBase64(bytes){
    let binary='';
    bytes.forEach(byte=>{binary+=String.fromCharCode(byte)});
    return btoa(binary);
  }
  function base64ToBytes(value){
    const binary=atob(value);
    return Uint8Array.from(binary,char=>char.charCodeAt(0));
  }
  const SHA256_H=new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const SHA256_K=new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ]);
  function rotr(value,amount){return ((value>>>amount)|(value<<(32-amount)))>>>0}
  function sha256Bytes(input){
    const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
    const bitLength=bytes.length*8;
    const paddedLength=(((bytes.length+8)>>6)+1)<<6;
    const data=new Uint8Array(paddedLength);
    data.set(bytes);data[bytes.length]=0x80;
    const view=new DataView(data.buffer);
    view.setUint32(paddedLength-8,Math.floor(bitLength/0x100000000),false);
    view.setUint32(paddedLength-4,bitLength>>>0,false);
    const hash=new Uint32Array(SHA256_H);
    const words=new Uint32Array(64);
    for(let offset=0;offset<paddedLength;offset+=64){
      for(let i=0;i<16;i++)words[i]=view.getUint32(offset+i*4,false);
      for(let i=16;i<64;i++){
        const s0=(rotr(words[i-15],7)^rotr(words[i-15],18)^(words[i-15]>>>3))>>>0;
        const s1=(rotr(words[i-2],17)^rotr(words[i-2],19)^(words[i-2]>>>10))>>>0;
        words[i]=(words[i-16]+s0+words[i-7]+s1)>>>0;
      }
      let a=hash[0],b=hash[1],c=hash[2],d=hash[3],e=hash[4],f=hash[5],g=hash[6],h=hash[7];
      for(let i=0;i<64;i++){
        const S1=(rotr(e,6)^rotr(e,11)^rotr(e,25))>>>0;
        const ch=((e&f)^((~e)&g))>>>0;
        const temp1=(h+S1+ch+SHA256_K[i]+words[i])>>>0;
        const S0=(rotr(a,2)^rotr(a,13)^rotr(a,22))>>>0;
        const maj=((a&b)^(a&c)^(b&c))>>>0;
        const temp2=(S0+maj)>>>0;
        h=g;g=f;f=e;e=(d+temp1)>>>0;d=c;c=b;b=a;a=(temp1+temp2)>>>0;
      }
      hash[0]=(hash[0]+a)>>>0;hash[1]=(hash[1]+b)>>>0;hash[2]=(hash[2]+c)>>>0;hash[3]=(hash[3]+d)>>>0;
      hash[4]=(hash[4]+e)>>>0;hash[5]=(hash[5]+f)>>>0;hash[6]=(hash[6]+g)>>>0;hash[7]=(hash[7]+h)>>>0;
    }
    const output=new Uint8Array(32);
    const outputView=new DataView(output.buffer);
    for(let i=0;i<8;i++)outputView.setUint32(i*4,hash[i],false);
    return output;
  }
  function bytesToHex(bytes){return Array.from(bytes).map(byte=>byte.toString(16).padStart(2,'0')).join('')}
  function hmacSha256(key,message){
    if(key.length>64)key=sha256Bytes(key);
    const inner=new Uint8Array(64+message.length);
    const outer=new Uint8Array(64+32);
    for(let i=0;i<64;i++){
      const value=i<key.length?key[i]:0;
      inner[i]=value^0x36;outer[i]=value^0x5c;
    }
    inner.set(message,64);
    outer.set(sha256Bytes(inner),64);
    return sha256Bytes(outer);
  }
  function pbkdf2Sha256(password,salt,iterations,keyLength=32){
    const blocks=Math.ceil(keyLength/32);
    const output=new Uint8Array(blocks*32);
    for(let block=1;block<=blocks;block++){
      const saltBlock=new Uint8Array(salt.length+4);
      saltBlock.set(salt);
      new DataView(saltBlock.buffer).setUint32(salt.length,block,false);
      let u=hmacSha256(password,saltBlock);
      const t=u.slice();
      for(let i=1;i<iterations;i++){
        u=hmacSha256(password,u);
        for(let j=0;j<32;j++)t[j]^=u[j];
      }
      output.set(t,(block-1)*32);
    }
    return output.slice(0,keyLength);
  }
  async function sha256(text){
    const bytes=new TextEncoder().encode(text);
    if(window.crypto&&window.crypto.subtle){
      const buffer=await crypto.subtle.digest('SHA-256',bytes);
      return bytesToHex(new Uint8Array(buffer));
    }
    return bytesToHex(sha256Bytes(bytes));
  }
  async function pbkdf2(password,salt,iterations=210000){
    const rounds=Number(iterations)||210000;
    if(window.crypto&&window.crypto.subtle){
      const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
      const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:base64ToBytes(salt),iterations:rounds,hash:'SHA-256'},material,256);
      return bytesToBase64(new Uint8Array(bits));
    }
    const bits=pbkdf2Sha256(new TextEncoder().encode(password),base64ToBytes(salt),rounds,32);
    return bytesToBase64(bits);
  }
  function getLocalCred(){
    try{
      const raw=localStorage.getItem(CRED_KEY);
      if(!raw)return null;
      const value=JSON.parse(raw);
      if(!value||typeof value.salt!=='string'||typeof value.hash!=='string')return null;
      return value;
    }catch{return null}
  }
  async function verifyPassword(password){
    const local=getLocalCred();
    if(local)return (await pbkdf2(password,local.salt,Number(local.iterations)||210000))===local.hash;
    return (await sha256(password))===AUTH_HASH;
  }
  async function saveLocalPassword(password){
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const saltText=bytesToBase64(salt);
    const hash=await pbkdf2(password,saltText,210000);
    localStorage.setItem(CRED_KEY,JSON.stringify({salt:saltText,hash,iterations:210000}));
  }
  function say(text){status.textContent=text;}
  function apply(slot,src){
    document.querySelectorAll(`[data-image-slot="${slot}"]`).forEach(img=>{img.src=src;img.hidden=false;});
    if(slot==='logo-site')document.querySelector('.logo-fallback').hidden=true;
    if(slot==='area-animacion'||slot==='area-modelado'){const placeholder=document.querySelector(`[data-placeholder="${slot}"]`);if(placeholder)placeholder.hidden=true;}
  }
  Object.entries(saved).forEach(([slot,src])=>{if(slots[slot]&&typeof src==='string')apply(slot,src)});
  function open(){
    if(!authed){openLogin();return;}
    panel.classList.add('open');panel.setAttribute('aria-hidden','false');backdrop.hidden=false;toggle.setAttribute('aria-expanded','true');
  }
  function close(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');backdrop.hidden=true;toggle.setAttribute('aria-expanded','false');}
  function openLogin(){
    login.hidden=false;login.setAttribute('aria-hidden','false');
    loginError.textContent='Correo o contraseña incorrectos.';loginError.classList.remove('info');loginError.hidden=true;
    loginForm.reset();loginSubmit.disabled=false;loginSubmit.textContent='Entrar';
    recovery.hidden=true;
    document.body.classList.add('login-open');
    setTimeout(()=>loginUser.focus(),40);
  }
  function closeLogin(restoreFocus=true){
    login.hidden=true;login.setAttribute('aria-hidden','true');
    document.body.classList.remove('login-open');
    recovery.hidden=true;
    if(restoreFocus)toggle.focus({preventScroll:true});
  }
  async function submitLogin(event){
    event.preventDefault();
    const user=loginUser.value.trim().toLowerCase();
    const pass=loginPass.value;
    loginError.hidden=true;loginError.classList.remove('info');
    loginSubmit.disabled=true;loginSubmit.textContent='Comprobando…';
    let ok=false,unavailable=false;
    try{ok=user===AUTH_USER&&(await verifyPassword(pass));}
    catch{unavailable=true;}
    loginSubmit.disabled=false;loginSubmit.textContent='Entrar';
    if(ok){
      setAuth(true);closeLogin(false);open();say('Sesión iniciada. Ya puedes cambiar las imágenes.');
      return;
    }
    loginError.textContent=unavailable?'No se pudo verificar el acceso en este navegador. Abre la página desde el servidor local.':'Correo o contraseña incorrectos.';
    loginError.hidden=false;
    if(!unavailable){loginPass.value='';loginPass.focus();}
  }
  toggle.addEventListener('click',()=>{
    if(!authed){openLogin();return;}
    if(panel.classList.contains('open'))close();else open();
  });
  loginForm.addEventListener('submit',submitLogin);
  loginClose.addEventListener('click',()=>closeLogin());
  login.addEventListener('click',event=>{if(event.target===login)closeLogin()});
  forgot.addEventListener('click',()=>{recovery.hidden=false;recovery.scrollIntoView({block:'nearest'});});
  recoveryBack.addEventListener('click',()=>{recovery.hidden=true;loginPass.focus();});
  resetLocal.addEventListener('click',()=>{
    if(!confirm('Esto borrará la contraseña guardada en este navegador y volverá a la contraseña inicial. ¿Continuar?'))return;
    try{localStorage.removeItem(CRED_KEY)}catch{}
    recovery.hidden=true;
    loginError.textContent='Contraseña local restablecida. Usa la contraseña inicial.';
    loginError.classList.add('info');loginError.hidden=false;
    loginPass.value='';loginPass.focus();
  });
  changeForm.addEventListener('submit',async event=>{
    event.preventDefault();
    changeStatus.classList.remove('error');
    const current=currentPassword.value,next=newPassword.value,confirm=confirmPassword.value;
    if(next.length<10){changeStatus.classList.add('error');changeStatus.textContent='La nueva contraseña debe tener al menos 10 caracteres.';return;}
    if(next!==confirm){changeStatus.classList.add('error');changeStatus.textContent='Las contraseñas nuevas no coinciden.';return;}
    if(next===current){changeStatus.classList.add('error');changeStatus.textContent='La nueva contraseña debe ser diferente a la actual.';return;}
    const submit=changeForm.querySelector('button[type="submit"]');
    submit.disabled=true;changeStatus.textContent='Comprobando…';
    try{
      if(!(await verifyPassword(current)))throw new Error('current');
      await saveLocalPassword(next);
      changeForm.reset();changeStatus.textContent='Contraseña actualizada en este navegador.';
      say('Contraseña actualizada. En otros dispositivos se mantiene la contraseña inicial.');
    }catch(error){
      changeStatus.classList.add('error');
      changeStatus.textContent=error.message==='current'?'La contraseña actual no es correcta.':'No se pudo guardar. Abre la página desde el servidor local.';
    }finally{submit.disabled=false;}
  });
  document.getElementById('adminClose').addEventListener('click',close);
  backdrop.addEventListener('click',close);
  if(logout)logout.addEventListener('click',()=>{setAuth(false);close();say('Sesión cerrada.');});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!login.hidden){closeLogin();return;}
    if(!backdrop.hidden)close();
  });
  const fields=document.getElementById('adminFields');
  for(const [group,names] of Object.entries(groups)){
    const section=document.createElement('section');section.className='admin-group';section.innerHTML=`<h3>${group}</h3>`;
    for(const slot of names){
      const row=document.createElement('label');row.className='upload-row';
      const name=document.createElement('span');name.textContent=slots[slot];
      const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('aria-label',`Elegir ${slots[slot]}`);
      input.addEventListener('change',async()=>{
        const file=input.files?.[0];if(!file)return;
        try{
          say(`Preparando ${slots[slot]}…`);
          const bitmap=await createImageBitmap(file);const max=1350,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
          const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
          const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
          const data=canvas.toDataURL('image/webp',.80);saved[slot]=data;localStorage.setItem(KEY,JSON.stringify(saved));apply(slot,data);say(`${slots[slot]} guardado en este navegador.`);
        }catch{say('No se pudo guardar. Prueba con una imagen JPG o PNG más pequeña.');}
      });
      row.append(name,input);section.append(row);
    }
    fields.append(section);
  }
  document.getElementById('exportConfig').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(saved)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='seleccion-imagenes-wicho.json';a.click();URL.revokeObjectURL(a.href);say('Selección descargada en un archivo JSON.');
  });
  document.getElementById('importConfig').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const data=JSON.parse(await file.text());if(!data||typeof data!=='object'||Array.isArray(data))throw Error();saved={};for(const [k,v] of Object.entries(data))if(slots[k]&&typeof v==='string'&&v.startsWith('data:image/'))saved[k]=v;localStorage.setItem(KEY,JSON.stringify(saved));location.reload();}
    catch{say('Ese archivo no contiene una selección válida.');}
  });
  document.getElementById('resetConfig').addEventListener('click',()=>{localStorage.removeItem(KEY);location.reload()});
})();
