module.exports=[95966,(a,b,c)=>{"use strict";b.exports=a.r(13674).vendored.contexts.HooksClientContext},67468,(a,b,c)=>{"use strict";b.exports=a.r(13674).vendored.contexts.ServerInsertedHtml},18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},13674,(a,b,c)=>{"use strict";b.exports=a.r(18622)},58772,(a,b,c)=>{"use strict";b.exports=a.r(13674).vendored["react-ssr"].ReactJsxRuntime},99046,(a,b,c)=>{"use strict";b.exports=a.r(13674).vendored["react-ssr"].React},94092,(a,b,c)=>{"use strict";b.exports=a.r(13674).vendored.contexts.AppRouterContext},11585,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},43367,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={DEFAULT_SEGMENT_KEY:function(){return l},PAGE_SEGMENT_KEY:function(){return k},addSearchParamsIfPageSegment:function(){return i},computeSelectedLayoutSegment:function(){return j},getSegmentValue:function(){return f},getSelectedLayoutSegmentPath:function(){return function a(b,c,d=!0,e=[]){let g;if(d)g=b[1][c];else{let a=b[1];g=a.children??Object.values(a)[0]}if(!g)return e;let h=f(g[0]);return!h||h.startsWith(k)?e:(e.push(h),a(g,c,!1,e))}},isGroupSegment:function(){return g},isParallelRouteSegment:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});function f(a){return Array.isArray(a)?a[1]:a}function g(a){return"("===a[0]&&a.endsWith(")")}function h(a){return a.startsWith("@")&&"@children"!==a}function i(a,b){if(a.includes(k)){let a=JSON.stringify(b);return"{}"!==a?k+"?"+a:k}return a}function j(a,b){if(!a||0===a.length)return null;let c="children"===b?a[0]:a[a.length-1];return c===l?null:c}let k="__PAGE__",l="__DEFAULT__"},57061,(a,b,c)=>{"use strict";function d(){let a,b,c=new Promise((c,d)=>{a=c,b=d});return{resolve:a,reject:b,promise:c}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"createPromiseWithResolvers",{enumerable:!0,get:function(){return d}})},67409,a=>{"use strict";var b=a.i(58772),c=a.i(99046),d=a.i(1360);function e(){let a=(0,d.useRouter)(),e=(0,d.useSearchParams)(),[f,g]=(0,c.useState)(""),[h,i]=(0,c.useState)(""),[j,k]=(0,c.useState)(!1);async function l(b){b.preventDefault(),i(""),k(!0);try{let b=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:f})});if(b.ok){let b=e.get("from")||"/";a.replace(b)}else{let a=await b.json();i(a.error||"Senha incorreta.")}}catch{i("Erro de conexão. Tente novamente.")}finally{k(!1)}}return(0,b.jsxs)("div",{className:"login-wrapper",children:[(0,b.jsxs)("form",{onSubmit:l,className:"login-card",children:[(0,b.jsx)("h1",{children:"Acesso restrito"}),(0,b.jsx)("p",{className:"login-subtitle",children:"Digite a senha para continuar"}),(0,b.jsx)("input",{type:"password",value:f,onChange:a=>g(a.target.value),placeholder:"Senha",required:!0,autoFocus:!0,className:"login-input"}),h&&(0,b.jsx)("p",{className:"login-error",children:h}),(0,b.jsx)("button",{type:"submit",disabled:j,className:"login-btn",children:j?"Verificando...":"Entrar"})]}),(0,b.jsx)("style",{children:`
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
            `})]})}function f(){return(0,b.jsx)(c.Suspense,{children:(0,b.jsx)(e,{})})}a.s(["default",()=>f])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__95489dc6._.js.map