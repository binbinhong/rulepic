const fs = require('fs');
const path = require('path');

// 清理不需要的文件
function cleanupBuild() {
  const standalonePath = path.join(process.cwd(), '.next/standalone');
  if (!fs.existsSync(standalonePath)) return;

  // 要删除的目录
  const dirsToRemove = [
    'cache',
    'node_modules/.cache',
    'node_modules/.pnpm',
  ];

  // 复制静态文件到 standalone 目录
  const staticPath = path.join(process.cwd(), '.next/static');
  const standaloneStaticPath = path.join(standalonePath, '.next/static');
  
  if (fs.existsSync(staticPath)) {
    fs.cpSync(staticPath, standaloneStaticPath, { recursive: true });
  }

  dirsToRemove.forEach(dir => {
    const fullPath = path.join(standalonePath, dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

cleanupBuild(); 