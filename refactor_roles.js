const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'Backend', 'src');
const prismaDir = path.join(__dirname, 'Backend', 'prisma');

const replacements = [
  { regex: /'ACHETEUR'/g, replacement: "'UTILISATEUR'" },
  { regex: /'VENDEUR'/g, replacement: "'UTILISATEUR'" },
  { regex: /'PROPRIETAIRE_LOUEUR'/g, replacement: "'PROFESSIONNEL'" },
  { regex: /'CONCESSIONNAIRE'/g, replacement: "'PROFESSIONNEL'" },
  { regex: /'GARAGE'/g, replacement: "'PROFESSIONNEL'" },
  { regex: /'COMPAGNIE_ASSURANCE'/g, replacement: "'PROFESSIONNEL'" },
  { regex: /'INSPECTEUR'/g, replacement: "'EXPERT'" },
  { regex: /'MODERATEUR'/g, replacement: "'ADMIN'" },
  { regex: /'SUPER_ADMIN'/g, replacement: "'ADMIN'" },
  // Remove duplicates in array like ['UTILISATEUR', 'UTILISATEUR'] later manually or handle here
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.prisma')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      // Clean up specific array duplicates
      content = content.replace(/ROLE_PROPRIETAIRE_LOUEUR/g, "ROLE_PROFESSIONNEL");
      content = content.replace(/ROLE_GARAGE/g, "ROLE_PROFESSIONNEL");
      content = content.replace(/ROLE_VENDEUR/g, "ROLE_UTILISATEUR");
      content = content.replace(/ROLE_ACHETEUR/g, "ROLE_UTILISATEUR");
      content = content.replace(/ROLE_INSPECTEUR/g, "ROLE_EXPERT");
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
processDirectory(prismaDir);
console.log('Done refactoring roles strings.');
