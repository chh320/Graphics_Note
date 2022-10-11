import { defineConfig } from 'islandjs';

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
            }
          ]
        }
      ]
    }
  }
});
