// ===== フォニックス：つづりを音のかたまりに分けて色をつけ、ルールを一言そえる =====
// 自動判定なので完全ではない。迷う単語は「例外」か「音で確認」に回す。
(function(){
const RULES={
 a:"a は短く「ア（エに近い）」",e:"e は短く「エ」",i:"i は短く「イ」",o:"o は短く「ア（オに近い）」",u:"u は短く「ア」",
 ae:"a_e（最後の e は読まない）で「エイ」",ie:"i_e（最後の e は読まない）で「アイ」",oe:"o_e（最後の e は読まない）で「オウ」",ue:"u_e（最後の e は読まない）で「ユー」",ee2:"e_e（最後の e は読まない）で「イー」",
 sh:"sh は「シュ」",ch:"ch・tch は「チ」",th:"th は舌を軽くかんで「ス／ズ」",ck:"ck は「ク」",ng:"ng は「ング」（グはほとんど言わない）",ph:"ph は「フ」",wh:"wh は「ウ（ワ）」",qu:"qu は「クワ」",
 ee:"ee・ea は「イー」",ai:"ai・ay は「エイ」",oa:"oa は「オウ」",ow:"ow は「オウ」か「アウ」",ou:"ou は「アウ」",oo:"oo は「ウー」（book などは短く「ウ」）",oi:"oi・oy は「オイ」",ew:"ew は「ユー／ウー」",aw:"au・aw は「オー」",igh:"igh は「アイ」（gh は読まない）",
 ar:"ar は「アー」",or:"or は「オー」",er:"er・ir・ur は口をあまり開けずに「アー」",
 tion:"tion は「ション」",ture:"ture は「チャー」",long:"長い単語は、強く読むところ（アクセント）を音声で確かめよう",c:"c は e・i・y の前で「ス」",g:"g は e・i・y の前で「ジ」になることが多い",y:"語の最後の y は「イ」か「アイ」",le:"語の最後の le は「ル」"
};
// きまりどおりに読めない、よく出る単語（音で覚える）
const EXC=new Set("the a an of to do does done one two once who whom whose what where were there their they them was wash want wanted said says have has give live love come some none gone son son money mother brother other another nothing month monday front country young touch double trouble you your four pour could would should group friend friends people again against any many busy business women woman eye buy guy build built bury very sure sugar pretty heart heard learn early earth bread breakfast head headache heavy ready weather great break steak ocean minute favorite promise answer island listen often castle knife know knew known write wrong wrote two sword half walk talk chalk calm word work world worry worse worst learning hear near year dear clear idea area climb comb school ache headache christmas stomach machine police magazine piano beautiful laugh enough tough though through thought bought brought caught daughter ago also only both most post ghost cold old gold hold told kind find mind child wild climb sign foreign hour honest science scissors colour color".split(" "));
const V="aeiou";
const isV=c=>!!c&&V.includes(c);
function seg1(word){
 const w=word.toLowerCase(),out=[];let i=0;
 const push=(t,k,r)=>out.push({t:word.slice(i,i+t.length),k,r});
 const vowelGroups=(w.match(/[aeiouy]+/g)||[]).length;
 // マジックe：1音節で「母音＋子音1つ＋e」で終わる語（make, time, home など）
 const me=/^[^aeiou]*([aeiou])([^aeiouwxy])e$/.exec(w);
 const magic=me&&vowelGroups===2?{pos:w.length-3,v:me[1]}:null;
 while(i<w.length){const s=w.slice(i),n=w[i+1]||"";
  const T=(re,k,r)=>{const m=re.exec(s);if(m){push(m[0],k,r);i+=m[0].length;return true}return false};
  if(magic&&i===magic.pos){push(w[i],"long",magic.v==="e"?"ee2":magic.v+"e");i++;continue}
  if(magic&&i===w.length-1){push("e","silent",null);i++;continue}
  if(T(/^tion/,"dig","tion")||T(/^ture/,"dig","ture")||T(/^tch/,"dig","ch")||T(/^igh/,"long","igh"))continue;
  if(T(/^(sh)/,"dig","sh")||T(/^(ch)/,"dig","ch")||T(/^(th)/,"dig","th")||T(/^(ck)/,"dig","ck")||T(/^ng(?![eiy])/,"dig","ng")||T(/^(ph)/,"dig","ph")||T(/^(wh)/,"dig","wh")||T(/^(qu)/,"dig","qu"))continue;
  if(T(/^(ee|ea)/,"long","ee")||T(/^(ai|ay)/,"long","ai")||T(/^(oa)/,"long","oa")||T(/^(ow)/,"long","ow")||T(/^(ou)/,"long","ou")||T(/^(oo)/,"long","oo")||T(/^(oi|oy)/,"long","oi")||T(/^(ew)/,"long","ew")||T(/^(au|aw)/,"long","aw"))continue;
  if(/^(ar|or|er|ir|ur)/.test(s)&&!isV(s[2]||"")&&s[2]!=="r"){T(/^(ar|or|er|ir|ur)/,"rc",s[0]==="a"?"ar":s[0]==="o"?"or":"er");continue}
  if(s==="le"&&i>0&&!isV(w[i-1])){push("le","cons","le");i+=2;continue}
  const c=w[i];
  if(c==="y"&&i===w.length-1&&i>0){push("y","long","y");i++;continue}
  if(isV(c)){push(c,"short",c);i++;continue}
  if(c==="c"&&"eiy".includes(n)){push(c,"cons","c");i++;continue}
  if(c==="g"&&"eiy".includes(n)&&i>0){push(c,"cons","g");i++;continue}
  push(c,"cons",null);i++}
 if(vowelGroups>=3)out.forEach(x=>{if(x.k==="short"||(x.k==="long"&&"y".includes(x.r||""))){x.k="cons";x.r=null}});
 return out}
function analyze(text){
 const parts=String(text).split(/(\s+|\/|~|\.|,|\?|!|'|-)/);const words=[];const segs=[];let exc=[];
 for(const p of parts){if(!p)continue;if(!/^[A-Za-z]+$/.test(p)){segs.push({t:p,k:"sep"});continue}
  if(EXC.has(p.toLowerCase())){exc.push(p);segs.push({t:p,k:"exc"});continue}
  segs.push(...seg1(p));words.push(p)}
 // ルールは目立つものを優先して2つまで（短母音だけの語は短母音を出す）
 const order=["tion","ture","ae","ie","oe","ue","ee2","igh","ee","ai","oa","ow","ou","oo","oi","ew","aw","ar","or","er","sh","ch","th","ck","ng","ph","wh","qu","c","g","le","y","a","e","i","o","u"];
 const found=[...new Set(segs.map(s=>s.r).filter(Boolean))].sort((a,b)=>order.indexOf(a)-order.indexOf(b));
 const rules=found.filter(r=>!"aeiou".includes(r)).slice(0,2);if(!rules.length&&found.length)rules.push(found[0]);
 const longW=words.some(w=>(w.toLowerCase().match(/[aeiouy]+/g)||[]).length>=3);
 if(longW){const keep=rules.filter(r=>!"aeiou".includes(r)).slice(0,1);rules.length=0;rules.push(...keep,"long")}
 return {segs,rules:rules.map(r=>RULES[r]),exc}}
const COL={cons:"#334155",short:"#2563eb",long:"#dc2626",rc:"#7c3aed",dig:"#059669",silent:"#cbd5e1",exc:"#0f172a",sep:"inherit"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function colored(text){const a=analyze(text);
 return a.segs.map(s=>s.k==="sep"?esc(s.t):`<span style="color:${COL[s.k]};${s.k==="silent"?"text-decoration:line-through;":""}${s.k!=="cons"&&s.k!=="exc"?"border-bottom:3px solid "+COL[s.k]+"55;":""}padding:0 1px">${esc(s.t)}</span>`).join("")}
function help(text){const a=analyze(text);
 if(a.exc.length)return `<div style="font-size:14px;margin-top:6px;color:#b45309">⚠ ${esc(a.exc.join("・"))} はきまりどおりに読めない単語。音で覚えよう</div>`+(a.rules.length?`<div style="font-size:14px;color:#475569">🔤 ${a.rules.map(esc).join("　/　")}</div>`:"");
 return a.rules.length?`<div style="font-size:14px;margin-top:6px;color:#475569">🔤 ${a.rules.map(esc).join("　/　")}</div>`:""}
window.PH={analyze,colored,help,RULES,EXC,
 legend:`<div style="font-size:12px;color:#64748b">色：<span style="color:#2563eb">短い母音</span>・<span style="color:#dc2626">長い母音</span>・<span style="color:#7c3aed">r のつく母音</span>・<span style="color:#059669">2文字で1つの音</span>・<span style="color:#94a3b8;text-decoration:line-through">読まない</span></div>`};
})();
