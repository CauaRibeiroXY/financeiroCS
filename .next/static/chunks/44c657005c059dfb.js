(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,17197,(e,r,n)=>{r.exports=e.r(2418)},14461,e=>{"use strict";var r=e.i(76648),n=e.i(35773),o=e.i(17197);function t(){let e=(0,o.useRouter)(),t=(0,o.useSearchParams)(),[i,a]=(0,n.useState)(""),[s,l]=(0,n.useState)(""),[c,d]=(0,n.useState)(!1);async function u(r){r.preventDefault(),l(""),d(!0);try{let r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:i})});if(r.ok){let r=t.get("from")||"/";e.replace(r)}else{let e=await r.json();l(e.error||"Senha incorreta.")}}catch{l("Erro de conexão. Tente novamente.")}finally{d(!1)}}return(0,r.jsxs)("div",{className:"login-wrapper",children:[(0,r.jsxs)("form",{onSubmit:u,className:"login-card",children:[(0,r.jsx)("h1",{children:"Acesso restrito"}),(0,r.jsx)("p",{className:"login-subtitle",children:"Digite a senha para continuar"}),(0,r.jsx)("input",{type:"password",value:i,onChange:e=>a(e.target.value),placeholder:"Senha",required:!0,autoFocus:!0,className:"login-input"}),s&&(0,r.jsx)("p",{className:"login-error",children:s}),(0,r.jsx)("button",{type:"submit",disabled:c,className:"login-btn",children:c?"Verificando...":"Entrar"})]}),(0,r.jsx)("style",{children:`
                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0f172a;
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .login-card {
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 2.5rem 2rem;
                    width: 100%;
                    max-width: 360px;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }
                .login-card h1 {
                    margin: 0;
                    font-size: 1.4rem;
                    color: #f1f5f9;
                    font-weight: 700;
                    text-align: center;
                }
                .login-subtitle {
                    margin: 0;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.9rem;
                }
                .login-input {
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #475569;
                    background: #0f172a;
                    color: #f1f5f9;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .login-input:focus {
                    border-color: #6366f1;
                }
                .login-error {
                    margin: 0;
                    color: #f87171;
                    font-size: 0.875rem;
                    text-align: center;
                }
                .login-btn {
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: none;
                    background: #6366f1;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, opacity 0.2s;
                }
                .login-btn:hover:not(:disabled) {
                    background: #4f46e5;
                }
                .login-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `})]})}function i(){return(0,r.jsx)(n.Suspense,{children:(0,r.jsx)(t,{})})}e.s(["default",()=>i])}]);