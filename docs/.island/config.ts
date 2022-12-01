import { defineConfig } from 'islandjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  title: 'Graphics Note',
  themeConfig: {
    sidebar: {
      '/': [
        {
          text: '目录',
          items: [
            {
              text: 'Learn OpenGL',
              link: '/OpenGL'
            },
            {
              text: 'Ray Tracing One Weekend',
              link: '/RayTracingOneWeekend'
            },
            {
              text: 'Ray Tracing The Next Week',
              link: '/RayTracingTheNextWeek'
            },
            {
              text: 'Games 101',
              link: '/games101'
            },
            {
              text: 'Games 202',
              link: '/Games202'
            }
          ]
        }
      ]
    }
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
});
