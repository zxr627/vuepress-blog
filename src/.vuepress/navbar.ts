import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  
  {
    text: '⚙️ 便捷工具',
    children: [
      {
        text: '文档',
        children: [
          { text: 'Markdown', icon: '/assets/icon/markdown.svg',  link: '/Tools/MarkDown/' },
          { text: 'Resource', icon: '/assets/icon/resources.svg', link: '/Tools/Resource/' },
        ]
      },
      {
        text: '工具',
        children: [
          { text: "Git", icon: '/assets/icon/git.svg', link: "/Tools/Git/" },
        ]
      }
    ]
  },

  { 
    text: '💻 基础知识',
    children: [
      {
        text: '基础',
        children: [
          { text: "计算机网络",  icon: '/assets/icon/network.svg', link: "/ComputerBasics/ComputerNetwork/" },
          { text: "操作系统", icon: '/assets/icon/os.svg', link: "/ComputerBasics/OpreatingSystem/" }
        ]
      },
      {
        text: '算法',
        children: [
          { text: '数据结构', icon: '/assets/icon/dataStructure.svg', link: "/ComputerBasics/DataStructure/" },
        ],
      }
    ]
  },

  { 
    text: '📑 数据存储',
    children: [
      {
        text: '数据库基础和原理',
        children: [
          { text: '数据库原理',  icon: '/assets/icon/database.svg', link: '/Database/Basic/Principle/' },
          { text: 'SQL语言',    icon: '/assets/icon/sql.svg',      link: '/Database/Basic/Language/' },
        ]
      },
      {
        text: 'SQL 数据库',
        children: [
          { text: "Mysql详解",  icon: '/assets/icon/mysql.svg', link: "/Database/SQL/" },
        ]
      },
      {
        text: 'NoSQL 数据库',
        children: [
          { text: "Redis详解",  icon: '/assets/icon/redis.svg', link: "/Database/NoSQL/" },
        ]
      }
    ]
  },

  { 
    text: '🔭 前端开发',
    children: [
      {
        text: '框架',
        children: [
          { text: "Vue", icon: '/assets/icon/vue.svg', link: "/FrontEnd/Vue/" },
        ]
      },
      {
        text: '理论知识',
        children: [
          { text: "JavaScript", icon: '/assets/icon/javascript.svg', link: "/FrontEnd/JavaScript/" },
          { text: "CSS",        icon: '/assets/icon/css.svg',        link: "/FrontEnd/CSS/" },
          { text: "HTML",       icon: '/assets/icon/html.svg',       link: "/FrontEnd/HTML/" },
        ]
      }
    ]
  },

  {
    text: '🖋️ 随笔',
    children: [
      {
        text: '分类',
        children: [
          { text: "🏺 历史漫谈", icon: '/assets/icon/history.svg', link: "/Essays/History/" },
          { text: "☕ 日常散文", icon: '/assets/icon/note.svg', link: "/Essays/Daily/" },
          { text: "✍️ 诗词作品", icon: '/assets/icon/poem.svg', link: "/Essays/Poem/" },
        ]
      },

    ]
  },
  { text: "📝 关于作者", icon: '/assets/icon/poem.svg', link: "intro.md" },
]);
