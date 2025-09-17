---
home: true
layout: BlogHome

title: 🏠️ 博客主页
heroText: In Time
tagline: 路漫漫其修远兮

#bgImage: https://raw.githubusercontent.com/zxr627/vuepress-blog/main/src/.vuepress/public/assets/bgImage/iTab-1k6ljv.webp
bgImage: /assets/bgImage/iTab-1k6ljv.webp

heroFullScreen: true

projects:
  - icon: /assets/icon/javaguide.svg
    name: JavaGuide
    desc: Java面试 + 学习指南
    link: https://javaguide.cn/home.html

  - icon: /assets/icon/xiaolin.svg
    name: 小林coding
    desc: 计算机基础
    link: https://www.xiaolincoding.com/

  - icon: /assets/icon/leetcode.svg
    name: LeetCode
    desc: 力扣
    link: https://leetcode.cn/

  - icon: /assets/icon/juejin.svg
    name: JueJin
    desc: 稀土掘金
    link: https://juejin.cn/

footer: "Powered by <a href=\"https://v2.vuepress.vuejs.org/zh/\" target=\"_blank\"> VuePress </a> "
copyright: Copyright © 2025 - present
  <center>
  <!-- 引入不蒜子统计脚本 -->
  <script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script>

  <span id="busuanzi_container_site_pv">
  本站总访问量 <span id="busuanzi_value_site_pv"></span> 次
  </span>
  |
  <span id="busuanzi_container_site_uv">
  本站访客数 <span id="busuanzi_value_site_uv"></span> 人次
  </span>
  |
  <span id="busuanzi_container_page_pv">
  本文总阅读量 <span id="busuanzi_value_page_pv"></span> 次
  </span>
  </center>
  <script>
      // 设置偏移量（可以按需修改）
      const offsets = {
    pv: 1150, // 总访问量 +150
    uv: 510,  // 总访客数 +50
    page_pv: 120 // 单页阅读量 +20
    };
    
      // 等不蒜子加载完后再修改
      document.addEventListener("DOMContentLoaded", function () {
      setTimeout(() => {
      const pv = document.getElementById("busuanzi_value_site_pv");
      const uv = document.getElementById("busuanzi_value_site_uv");
      const pagePv = document.getElementById("busuanzi_value_page_pv");
    
      if (pv && pv.innerText) {
      pv.innerText = parseInt(pv.innerText) + offsets.pv;
      }
      if (uv && uv.innerText) {
      uv.innerText = parseInt(uv.innerText) + offsets.uv;
      }
      if (pagePv && pagePv.innerText) {
      pagePv.innerText = parseInt(pagePv.innerText) + offsets.page_pv;
      }
    }, 1500); // 延迟，确保不蒜子已填充数值
    });
      </script>
#copyright: Copyright © 2025 - present <center><script async src="//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js"></script></center>
---
