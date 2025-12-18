#!/usr/bin/env node

/**
 * Simple script to convert lcov.info to cobertura XML format
 * This is a basic implementation for SonarQube compatibility
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lcovFile = process.argv[2] || 'coverage/lcov.info';
const outputFile = process.argv[3] || 'coverage/cobertura-coverage.xml';

if (!fs.existsSync(lcovFile)) {
  console.error(`Error: ${lcovFile} not found`);
  process.exit(1);
}

const lcovContent = fs.readFileSync(lcovFile, 'utf8');
const lines = lcovContent.split('\n');

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE coverage SYSTEM "http://cobertura.sourceforge.net/xml/coverage-04.dtd">
<coverage line-rate="0" branch-rate="0" lines-covered="0" lines-valid="0" branches-covered="0" branches-valid="0" complexity="0" version="0.4" timestamp="${Math.floor(Date.now() / 1000)}">
  <sources>
    <source>${process.cwd()}</source>
  </sources>
  <packages>
`;

let currentPackage = null;
let currentClass = null;
let totalLines = 0;
let coveredLines = 0;
let totalBranches = 0;
let coveredBranches = 0;

const packages = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('SF:')) {
    const filePath = line.substring(3);
    const relativePath = path.relative(process.cwd(), filePath);
    const pkg = path.dirname(relativePath) || '.';
    const className = path.basename(relativePath);
    
    if (!packages[pkg]) {
      packages[pkg] = { classes: {} };
    }
    
    currentPackage = pkg;
    currentClass = className;
    
    if (!packages[pkg].classes[className]) {
      packages[pkg].classes[className] = {
        lines: {},
        branches: {}
      };
    }
  } else if (line.startsWith('DA:') && currentClass) {
    const match = line.match(/DA:(\d+),(\d+)/);
    if (match) {
      const lineNum = match[1];
      const hit = parseInt(match[2]);
      packages[currentPackage].classes[currentClass].lines[lineNum] = hit;
      totalLines++;
      if (hit > 0) coveredLines++;
    }
  } else if (line.startsWith('BRDA:') && currentClass) {
    const match = line.match(/BRDA:(\d+),(\d+),(\d+),(\d+|-)/);
    if (match) {
      const lineNum = match[1];
      const block = match[2];
      const branch = match[3];
      const taken = match[4] === '-' ? 0 : parseInt(match[4]);
      const key = `${lineNum}_${block}_${branch}`;
      packages[currentPackage].classes[currentClass].branches[key] = taken;
      totalBranches++;
      if (taken > 0) coveredBranches++;
    }
  }
}

// Calculate rates
const lineRate = totalLines > 0 ? coveredLines / totalLines : 0;
const branchRate = totalBranches > 0 ? coveredBranches / totalBranches : 0;

xml = xml.replace('line-rate="0"', `line-rate="${lineRate.toFixed(4)}"`);
xml = xml.replace('branch-rate="0"', `branch-rate="${branchRate.toFixed(4)}"`);
xml = xml.replace('lines-covered="0"', `lines-covered="${coveredLines}"`);
xml = xml.replace('lines-valid="0"', `lines-valid="${totalLines}"`);
xml = xml.replace('branches-covered="0"', `branches-covered="${coveredBranches}"`);
xml = xml.replace('branches-valid="0"', `branches-valid="${totalBranches}"`);

// Generate XML for packages and classes
for (const [pkgName, pkg] of Object.entries(packages)) {
  let pkgLines = 0;
  let pkgCovered = 0;
  let pkgBranches = 0;
  let pkgCoveredBranches = 0;
  
  xml += `    <package name="${pkgName.replace(/\\/g, '/')}" line-rate="0" branch-rate="0" complexity="0">
      <classes>
`;
  
  for (const [className, classData] of Object.entries(pkg.classes)) {
    const classLines = Object.keys(classData.lines).length;
    const classCovered = Object.values(classData.lines).filter(h => h > 0).length;
    const classBranches = Object.keys(classData.branches).length;
    const classCoveredBranches = Object.values(classData.branches).filter(h => h > 0).length;
    
    pkgLines += classLines;
    pkgCovered += classCovered;
    pkgBranches += classBranches;
    pkgCoveredBranches += classCoveredBranches;
    
    const classLineRate = classLines > 0 ? classCovered / classLines : 0;
    const classBranchRate = classBranches > 0 ? classCoveredBranches / classBranches : 0;
    
    xml += `        <class name="${className}" filename="${pkgName.replace(/\\/g, '/')}/${className}" line-rate="${classLineRate.toFixed(4)}" branch-rate="${classBranchRate.toFixed(4)}" complexity="0">
          <methods/>
          <lines>
`;
    
    for (const [lineNum, hit] of Object.entries(classData.lines)) {
      xml += `            <line number="${lineNum}" hits="${hit}" branch="false"/>\n`;
    }
    
    xml += `          </lines>
        </class>
`;
  }
  
  const pkgLineRate = pkgLines > 0 ? pkgCovered / pkgLines : 0;
  const pkgBranchRate = pkgBranches > 0 ? pkgCoveredBranches / pkgBranches : 0;
  
  xml = xml.replace(`<package name="${pkgName.replace(/\\/g, '/')}" line-rate="0" branch-rate="0"`, 
    `<package name="${pkgName.replace(/\\/g, '/')}" line-rate="${pkgLineRate.toFixed(4)}" branch-rate="${pkgBranchRate.toFixed(4)}"`);
  
  xml += `      </classes>
    </package>
`;
}

xml += `  </packages>
</coverage>`;

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputFile, xml);
console.log(`Successfully converted ${lcovFile} to ${outputFile}`);

