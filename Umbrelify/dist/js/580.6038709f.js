"use strict";(self["webpackChunkproject"]=self["webpackChunkproject"]||[]).push([[580],{2580:function(e,t,a){a.r(t),a.d(t,{default:function(){return U}});var n=a(3396),r=a(2268);const i={id:"profile_card",class:"vertical-center"},s={class:"container bg-dark rounded-5 opacity-75",style:{"max-height":"85vh"}},c={class:"row"},d={class:"col-12 col-md-6 p-3 d-flex justify-content-center"},l=["src"],o={class:"col-12 col-md-6 text-light align-self-center"},u={class:"text-center text-md-start"},g={key:0,class:"badge rounded-pill text-bg-warning"},m={key:1,class:"badge rounded-pill text-bg-warning"},h={id:"email",class:"text-center text-md-start"},p={class:"text-center text-md-start"},f={class:"text-center text-md-start"},w=(0,n._)("div",null,[(0,n._)("h1",{style:{color:"white"}},"Look at past records"),(0,n._)("select",{name:"",id:""},[(0,n._)("option",{value:""})])],-1);function _(e,t,a,_,k,v){return(0,n.wg)(),(0,n.iD)("main",i,[(0,n._)("div",s,[(0,n._)("div",c,[(0,n._)("div",d,[(0,n._)("img",{src:k.src,style:{"max-width":"50%"}},null,8,l)]),(0,n._)("div",o,[(0,n._)("h1",u,[(0,n.Uk)(" @"+(0,r.zw)(k.username)+" ",1),1==k.rank&&"Male"==k.gender?((0,n.wg)(),(0,n.iD)("span",g,"Rain Kor Kor")):1==k.rank&&"Female"==k.gender?((0,n.wg)(),(0,n.iD)("span",m,"Rain Jie Jie")):(0,n.kq)("",!0)]),(0,n._)("h4",h,(0,r.zw)(k.email),1),(0,n._)("h4",p,"Rain Count: "+(0,r.zw)(k.raincount),1),(0,n._)("h4",f,"Ranking: "+(0,r.zw)(k.rank),1)])])]),w])}var k=a(6035),v=a(6056),x={data(){return{username:"",email:"",raincount:"",rank:"",gender:"",img:"",activityArr:[],src:""}},async created(){var e=v.I.currentUser,t=e.uid,n=e.email;const r=(0,k.JU)(v.db,"UserInfo",t),i=await(0,k.QT)(r);this.username=i.data().username,this.raincount=i.data().rain_event_count,this.rank=i.data().ranking,this.gender=i.data().gender,this.email=n,"Male"==this.gender?this.src=a(2365):this.src=a(3738);const s=(0,k.IO)((0,k.hJ)(v.db,n)),c=await(0,k.PL)(s);c.forEach((e=>{console.log(e.id," => ",e.data())}))}},b=a(89);const y=(0,b.Z)(x,[["render",_]]);var z=y;const D={id:"profile"};var J={__name:"ProfileView",setup(e){return(e,t)=>((0,n.wg)(),(0,n.iD)("main",D,[(0,n.Wm)(z)]))}};const R=J;var U=R},3738:function(e,t,a){e.exports=a.p+"img/female.d9d13d44.png"},2365:function(e,t,a){e.exports=a.p+"img/male.c753edf4.png"}}]);
//# sourceMappingURL=580.6038709f.js.map