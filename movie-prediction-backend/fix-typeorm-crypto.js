/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Para encontrar la ruta del módulo con pnpm
const findModule = (moduleName) => {
  try {
    // Obtener la ruta base de node_modules
    const baseDir = path.join(__dirname, 'node_modules');
    
    // Buscar en la estructura de pnpm
    const pnpmDir = path.join(baseDir, '.pnpm');
    
    // Si existe la estructura de pnpm
    if (fs.existsSync(pnpmDir)) {
      const dirs = fs.readdirSync(pnpmDir);
      // Buscar directorios que contienen el nombre del módulo
      const moduleDir = dirs.find(dir => dir.startsWith(moduleName.replace('/', '+')));
      
      if (moduleDir) {
        return path.join(pnpmDir, moduleDir, 'node_modules', moduleName);
      }
    }
    
    // Fallback a la estructura normal
    return path.join(baseDir, moduleName);
  } catch (error) {
    console.error('Error al buscar el módulo:', error);
    return null;
  }
};

// Buscar el módulo @nestjs/typeorm
const typeormPath = findModule('@nestjs/typeorm');
console.log('Ruta de TypeORM:', typeormPath);

if (typeormPath) {
  const utilsFile = path.join(typeormPath, 'dist/common/typeorm.utils.js');
  
  if (fs.existsSync(utilsFile)) {
    console.log('Archivo encontrado:', utilsFile);
    let content = fs.readFileSync(utilsFile, 'utf8');
    
    // Verificar si ya tiene la importación de crypto
    if (!content.includes("const crypto = require('crypto')")) {
      console.log('Aplicando parche...');
      // Añadir la importación al inicio del archivo
      content = "const crypto = require('crypto');\n" + content;
      fs.writeFileSync(utilsFile, content, 'utf8');
      console.log('Parche aplicado correctamente');
    } else {
      console.log('El parche ya está aplicado');
    }
  } else {
    console.log('Archivo no encontrado:', utilsFile);
  }
} else {
  console.log('No se encontró el módulo @nestjs/typeorm');
}