#!/usr/bin/env node

/**
 * Script to fix React Native Web deprecation warnings
 * Run with: node fix-deprecation-warnings.js
 */

const fs = require('fs');
const path = require('path');

// Directories to scan for React Native components
const SCAN_DIRS = ['src/screens', 'src/components', '.'];
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

function fixImageDeprecations(content) {
  // Fix resizeMode in style to props
  content = content.replace(
    /<Image([^>]*?)style=\{\{([^}]*?)resizeMode:\s*['"]([^'"]*)['"]([^}]*?)\}\}([^>]*?)>/g,
    (match, beforeStyle, styleStart, resizeMode, styleEnd, afterStyle) => {
      const cleanedStyle = (styleStart + styleEnd).replace(/,\s*,/g, ',').replace(/^\s*,|,\s*$/g, '');
      const styleAttr = cleanedStyle.trim() ? `style={{${cleanedStyle}}}` : '';
      return `<Image${beforeStyle}${styleAttr} resizeMode="${resizeMode}"${afterStyle}>`;
    }
  );
  
  // Fix tintColor in style to props
  content = content.replace(
    /<Image([^>]*?)style=\{\{([^}]*?)tintColor:\s*['"]([^'"]*)['"]([^}]*?)\}\}([^>]*?)>/g,
    (match, beforeStyle, styleStart, tintColor, styleEnd, afterStyle) => {
      const cleanedStyle = (styleStart + styleEnd).replace(/,\s*,/g, ',').replace(/^\s*,|,\s*$/g, '');
      const styleAttr = cleanedStyle.trim() ? `style={{${cleanedStyle}}}` : '';
      return `<Image${beforeStyle}${styleAttr} tintColor="${tintColor}"${afterStyle}>`;
    }
  );
  
  return content;
}

function fixPointerEvents(content) {
  // Fix pointerEvents prop to style
  content = content.replace(
    /(<\w+[^>]*?)\s+pointerEvents=['"]([^'"]*)['"]([^>]*?>)/g,
    (match, beforeProp, pointerEvents, afterProp) => {
      // Check if style prop already exists
      if (beforeProp.includes('style=')) {
        // Add to existing style
        return beforeProp.replace(
          /style=\{\{([^}]*)\}\}/,
          `style={{$1, pointerEvents: '${pointerEvents}'}}`
        ) + afterProp;
      } else {
        // Add new style prop
        return `${beforeProp} style={{pointerEvents: '${pointerEvents}'}}${afterProp}`;
      }
    }
  );
  
  return content;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = fixImageDeprecations(content);
    content = fixPointerEvents(content);
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed deprecations in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Starting React Native Web deprecation fixes...\n');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  SCAN_DIRS.forEach(dir => {
    const files = getAllFiles(dir);
    
    files.forEach(file => {
      totalFiles++;
      if (processFile(file)) {
        fixedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files with fixes applied: ${fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n🎉 Deprecation warnings should be reduced!');
    console.log('💡 Restart your development server to see the changes.');
  } else {
    console.log('\n✨ No deprecation issues found in your code!');
  }
  
  console.log('\n📚 For remaining warnings from libraries, see REACT_NATIVE_WEB_WARNINGS_SOLUTION.md');
}

if (require.main === module) {
  main();
}

module.exports = { fixImageDeprecations, fixPointerEvents, processFile };