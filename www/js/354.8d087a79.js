"use strict";(self["webpackChunkreporter"]=self["webpackChunkreporter"]||[]).push([[354],{69354:(e,t,s)=>{s.r(t),s.d(t,{default:()=>C});var r=s(83673);function o(e,t,s,o,n,i){const c=(0,r.up)("childs-categories"),a=(0,r.up)("q-page");return(0,r.wg)(),(0,r.j4)(a,null,{default:(0,r.w5)((()=>[(0,r.Wm)(c)])),_:1})}var n=s(62323);const i={class:"row q-py-md"},c=["src"],a=["onClick"];function u(e,t,s,o,u,d){const l=(0,r.up)("q-btn");return(0,r.wg)(),(0,r.iD)("div",i,[((0,r.wg)(!0),(0,r.iD)(r.HY,null,(0,r.Ko)(d.subcategories,(e=>((0,r.wg)(),(0,r.iD)("div",{class:"col-6 q-py-md text-center",key:"subcat-"+e.id},[(0,r.Wm)(l,{round:"",color:"primary",size:"20px",onClick:t=>d.goNext(e.id)},{default:(0,r.w5)((()=>[(0,r._)("img",{src:e.img,style:{"max-height":"30px"}},null,8,c)])),_:2},1032,["onClick"]),(0,r._)("div",{class:"text-subtitle2 q-pt-sm",onClick:t=>d.goNext(e.id)},(0,n.zw)(e.name),9,a)])))),128))])}var d=s(93617);const l={mounted(){},data(){return{}},methods:{async goNext(e){await this.$router.push({path:"/categories/"+e+"/issue"})}},computed:{...(0,d.Se)({categories:"company/categories"}),subcategories(){return this.categories.find((e=>e.id===Math.trunc(this.$route.params.id))).childs}}};var p=s(74260),g=s(48240),m=s(7518),h=s.n(m);const w=(0,p.Z)(l,[["render",u]]),k=w;h()(l,"components",{QBtn:g.Z});const f={components:{ChildsCategories:k},mounted(){this.$q.loading.hide()},data(){return{}},methods:{}};var v=s(24379);const x=(0,p.Z)(f,[["render",o]]),C=x;h()(f,"components",{QPage:v.Z})}}]);