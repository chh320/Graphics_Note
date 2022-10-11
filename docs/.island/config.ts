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
