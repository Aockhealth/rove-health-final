const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'frontend/src/app/cycle-sync/plan/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const startMarker = 'const BLUEPRINTS: any = {';
const endMarker = '};\n\n// --- Setup Constants ---';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker) + 2;

if (startIndex === -1 || endIndex < startIndex) {
    console.error("Could not find BLUEPRINTS");
    process.exit(1);
}

let blueprintsContent = content.substring(startIndex, endIndex);

// Replace icon references with strings
blueprintsContent = blueprintsContent.replace(/icon: ([A-Z][a-zA-Z0-9]*)(?=\s*\}|,)/g, 'icon: "$1"');

const exportContent = `export ${blueprintsContent}\n`;
const outPath = path.join(__dirname, 'shared/content/plan-blueprints.ts');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, exportContent);

// Now update page.tsx to import it and remove the definition
const updatedPage = content.substring(0, startIndex) + content.substring(endIndex);

// Add import near top
const importStatement = `import { BLUEPRINTS as RAW_BLUEPRINTS } from "@shared/content/plan-blueprints";\n`;
const importRegex = /import .* from ["']lucide-react["'];\n/;
const match = updatedPage.match(importRegex);

let finalPage = updatedPage;
if (match) {
    const insertIdx = match.index + match[0].length;
    finalPage = updatedPage.substring(0, insertIdx) + importStatement + updatedPage.substring(insertIdx);
}

// Add icon mapping logic after import
const mapLogic = `
import * as LucideIcons from "lucide-react";

// Restore icon references from string keys for the web UI
const BLUEPRINTS: any = JSON.parse(JSON.stringify(RAW_BLUEPRINTS));
Object.keys(BLUEPRINTS).forEach(phase => {
    BLUEPRINTS[phase].diet.core_needs.forEach((need: any) => {
        if (typeof need.icon === 'string' && (LucideIcons as any)[need.icon]) {
            need.icon = (LucideIcons as any)[need.icon];
        }
    });
    BLUEPRINTS[phase].diet.ideal_meals.forEach((meal: any) => {
        if (typeof meal.icon === 'string' && (LucideIcons as any)[meal.icon]) {
            meal.icon = (LucideIcons as any)[meal.icon];
        }
    });
});

`;
const customComponentsIdx = finalPage.indexOf('// --- Custom Components ---');
finalPage = finalPage.substring(0, customComponentsIdx) + mapLogic + finalPage.substring(customComponentsIdx);

fs.writeFileSync(pagePath, finalPage);
console.log("Successfully extracted BLUEPRINTS.");

