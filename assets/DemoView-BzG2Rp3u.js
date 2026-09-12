import{_ as i,w as d,c as r,r as l,u as m,o as n,g as p}from"./index-CIO8N3zz.js";function u(s){return String(s).replace(/[&<>"]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[t])}function _({title:s,html:t,css:o,js:e}){const a=o.replace(/<\/style/gi,"<\\/style"),c=e.replace(/<\/script/gi,"<\\/script");return`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${u(s)}</title>
  <style>${a}</style>
</head>
<body>
  ${t}
  <script>${c}<\/script>
</body>
</html>`}const h={class:"demo-page"},y=["srcdoc"],f={key:1},g={key:2},v={__name:"DemoView",setup(s){const t=m(),o=l(""),e=l("loading");return d(()=>t.params.designId,async a=>{e.value="loading";try{const c=await p(a);o.value=_(c),e.value="ready"}catch{e.value="error"}},{immediate:!0}),(a,c)=>(n(),r("main",h,[e.value==="ready"?(n(),r("iframe",{key:0,srcdoc:o.value,title:"Live design demo",sandbox:"allow-scripts allow-forms allow-modals",referrerpolicy:"no-referrer"},null,8,y)):e.value==="error"?(n(),r("p",f,"تعذر تحميل هذا التصميم.")):(n(),r("p",g,"جاري تشغيل التصميم…"))]))}},D=i(v,[["__scopeId","data-v-3886be3f"]]);export{D as default};
