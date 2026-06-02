'use strict';

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const dotenv = require('dotenv');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const appRoutesFilePath = path.join(
  projectRoot,
  'src',
  'app',
  'App.components',
  'AppRoutes',
  'AppRoutes.controller.tsx',
);
const sitemapOutputPath = path.join(projectRoot, 'public', 'sitemap.xml');
const metadataFilePath = path.join(projectRoot, 'public', 'metadata', 'contract_metadata.json');
const packageJsonPath = path.join(projectRoot, 'package.json');

const EXCLUDED_PATH_PREFIXES = ['/dashboard-personal'];
const EXCLUDED_PATHS = new Set(['/admin', '/become-satellite']);
const DYNAMIC_ROUTE_OVERRIDES = {
  '/break-glass-council/:tabId?': ['/break-glass-council'],
  '/maven-council/:tabId?': ['/maven-council'],
  '/satellite-governance/:tabId?': ['/satellite-governance'],
  '/vaults/:tabId': ['/vaults/all'],
};

const moduleFileExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const exportedStringCache = new Map();

function loadEnvironmentVariables() {
  const dotenvBasePath = path.join(projectRoot, '.env');
  const dotenvFiles = [
    `${dotenvBasePath}.${process.env.NODE_ENV}.local`,
    process.env.NODE_ENV !== 'test' ? `${dotenvBasePath}.local` : null,
    `${dotenvBasePath}.${process.env.NODE_ENV}`,
    dotenvBasePath,
  ].filter(Boolean);

  for (const dotenvFilePath of dotenvFiles) {
    if (!fs.existsSync(dotenvFilePath)) {
      continue;
    }

    dotenv.config({
      path: dotenvFilePath,
    });
  }
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseModule(filePath) {
  return parser.parse(fs.readFileSync(filePath, 'utf8'), {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}

function unwrapLiteralExpression(node) {
  if (t.isTSAsExpression(node) || t.isTSSatisfiesExpression(node) || t.isTypeCastExpression(node)) {
    return unwrapLiteralExpression(node.expression);
  }

  return node;
}

function resolveLocalModulePath(importPath, fromFilePath) {
  const basePath = importPath.startsWith('.')
    ? path.resolve(path.dirname(fromFilePath), importPath)
    : path.join(srcRoot, importPath);

  if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
    return basePath;
  }

  for (const extension of moduleFileExtensions) {
    const filePath = `${basePath}${extension}`;

    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  for (const extension of moduleFileExtensions) {
    const indexFilePath = path.join(basePath, `index${extension}`);

    if (fs.existsSync(indexFilePath)) {
      return indexFilePath;
    }
  }

  return null;
}

function getExportedStrings(filePath) {
  if (exportedStringCache.has(filePath)) {
    return exportedStringCache.get(filePath);
  }

  const exportedStrings = {};
  const ast = parseModule(filePath);

  traverse(ast, {
    ExportNamedDeclaration(exportPath) {
      const declaration = exportPath.node.declaration;

      if (!t.isVariableDeclaration(declaration)) {
        return;
      }

      for (const variable of declaration.declarations) {
        if (!t.isIdentifier(variable.id) || !variable.init) {
          continue;
        }

        const initializer = unwrapLiteralExpression(variable.init);

        if (t.isStringLiteral(initializer)) {
          exportedStrings[variable.id.name] = initializer.value;
        }
      }
    },
  });

  exportedStringCache.set(filePath, exportedStrings);

  return exportedStrings;
}

function getImportedStringConstants(filePath) {
  const ast = parseModule(filePath);
  const importedStrings = {};

  traverse(ast, {
    ImportDeclaration(importPath) {
      const sourcePath = importPath.node.source.value;
      const resolvedSourcePath = resolveLocalModulePath(sourcePath, filePath);

      if (!resolvedSourcePath) {
        return;
      }

      const exportedStrings = getExportedStrings(resolvedSourcePath);

      for (const specifier of importPath.node.specifiers) {
        if (!t.isImportSpecifier(specifier)) {
          continue;
        }

        const importedName = t.isIdentifier(specifier.imported) ? specifier.imported.name : specifier.imported.value;
        const localName = specifier.local.name;
        const exportedValue = exportedStrings[importedName];

        if (typeof exportedValue === 'string') {
          importedStrings[localName] = exportedValue;
        }
      }
    },
  });

  return importedStrings;
}

function evaluateStringNode(node, importedStrings) {
  const normalizedNode = unwrapLiteralExpression(node);

  if (t.isStringLiteral(normalizedNode)) {
    return normalizedNode.value;
  }

  if (t.isTemplateLiteral(normalizedNode)) {
    return normalizedNode.quasis.reduce((result, quasi, index) => {
      const expression = normalizedNode.expressions[index];

      if (!expression) {
        return result + quasi.value.cooked;
      }

      const resolvedExpression = evaluateStringNode(expression, importedStrings);

      if (typeof resolvedExpression !== 'string') {
        throw new Error(`Unable to resolve template expression in ${appRoutesFilePath}`);
      }

      return result + quasi.value.cooked + resolvedExpression;
    }, '');
  }

  if (t.isIdentifier(normalizedNode)) {
    return importedStrings[normalizedNode.name];
  }

  return undefined;
}

function getJsxAttribute(node, attributeName) {
  return node.openingElement.attributes.find(
    attribute => t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name, { name: attributeName }),
  );
}

function getJsxElementName(node) {
  if (t.isJSXIdentifier(node.openingElement.name)) {
    return node.openingElement.name.name;
  }

  return null;
}

function getPathAttributeValue(node, importedStrings) {
  const pathAttribute = getJsxAttribute(node, 'path');

  if (!pathAttribute || !pathAttribute.value) {
    return null;
  }

  if (t.isStringLiteral(pathAttribute.value)) {
    return pathAttribute.value.value;
  }

  if (t.isJSXExpressionContainer(pathAttribute.value)) {
    return evaluateStringNode(pathAttribute.value.expression, importedStrings) ?? null;
  }

  return null;
}

function getRouteElementType(node) {
  const elementAttribute = getJsxAttribute(node, 'element');

  if (!elementAttribute || !elementAttribute.value || !t.isJSXExpressionContainer(elementAttribute.value)) {
    return null;
  }

  const expression = unwrapLiteralExpression(elementAttribute.value.expression);

  if (!t.isJSXElement(expression)) {
    return null;
  }

  return getJsxElementName(expression);
}

function normalizePath(routePath) {
  const normalizedPath = routePath.replace(/\/+/g, '/').replace(/\/$/, '');

  return normalizedPath === '' ? '/' : normalizedPath;
}

function resolveFullPath(parentPath, routePath) {
  if (!routePath) {
    return parentPath;
  }

  if (routePath.startsWith('/')) {
    return normalizePath(routePath);
  }

  if (!parentPath || parentPath === '/') {
    return normalizePath(`/${routePath}`);
  }

  return normalizePath(`${parentPath}/${routePath}`);
}

function shouldExcludePath(routePath) {
  return EXCLUDED_PATHS.has(routePath) || EXCLUDED_PATH_PREFIXES.some(prefix => routePath.startsWith(prefix));
}

function isSitemapEligible({ path: routePath, isProtected, isRedirect }) {
  if (!routePath || routePath.includes('*') || isProtected || isRedirect) {
    return false;
  }

  if (shouldExcludePath(routePath)) {
    return false;
  }

  return true;
}

function getCanonicalPaths(routePath) {
  if (DYNAMIC_ROUTE_OVERRIDES[routePath]) {
    return DYNAMIC_ROUTE_OVERRIDES[routePath];
  }

  if (routePath.includes(':')) {
    return [];
  }

  return [routePath];
}

function collectRouteNodes(node, importedStrings, parentState = { fullPath: '', isProtected: false }) {
  const collectedRoutes = [];

  for (const child of node.children) {
    if (!t.isJSXElement(child) || getJsxElementName(child) !== 'Route') {
      continue;
    }

    const routePath = getPathAttributeValue(child, importedStrings);
    const fullPath = resolveFullPath(parentState.fullPath, routePath);
    const elementType = getRouteElementType(child);
    const isProtected = parentState.isProtected || elementType === 'ProtectedRoute';
    const isRedirect = elementType === 'Navigate';
    const routeState = {
      path: fullPath,
      isProtected,
      isRedirect,
    };

    collectedRoutes.push(routeState);
    collectedRoutes.push(...collectRouteNodes(child, importedStrings, { fullPath, isProtected }));
  }

  return collectedRoutes;
}

function getRoutePaths() {
  const importedStrings = getImportedStringConstants(appRoutesFilePath);
  const ast = parseModule(appRoutesFilePath);
  let routeRoot = null;

  traverse(ast, {
    JSXElement(routePath) {
      if (routeRoot || !['Routes', 'Switch'].includes(getJsxElementName(routePath.node))) {
        return;
      }

      routeRoot = routePath.node;
      routePath.stop();
    },
  });

  if (!routeRoot) {
    throw new Error(`Unable to find route tree in ${appRoutesFilePath}`);
  }

  return collectRouteNodes(routeRoot, importedStrings)
    .filter(isSitemapEligible)
    .flatMap(({ path: routePath }) => getCanonicalPaths(routePath))
    .map(normalizePath)
    .filter(routePath => !shouldExcludePath(routePath));
}

function isAbsoluteHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

function normalizeSiteUrl(siteUrl) {
  return siteUrl.replace(/\/+$/, '');
}

function getSiteUrl() {
  const packageJson = readJson(packageJsonPath);
  const metadata = readJson(metadataFilePath);
  const network = process.env.REACT_APP_NETWORK || process.env.VITE_NETWORK;
  const networkFallbackUrl = network === 'ghostnet' ? 'https://ghostnet.mavryk.finance' : 'https://atlasnet.mavenfinance.io';
  const defaultDevelopmentUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null;
  const candidates = [
    process.env.SITEMAP_SITE_URL,
    process.env.VITE_SITEMAP_SITE_URL,
    process.env.REACT_APP_SITE_URL,
    process.env.VITE_SITE_URL,
    process.env.PUBLIC_URL,
    defaultDevelopmentUrl,
    networkFallbackUrl,
    packageJson?.homepage,
    metadata?.homepage,
  ];

  const siteUrl = candidates.find(isAbsoluteHttpUrl);

  if (!siteUrl) {
    throw new Error('Unable to resolve an absolute site URL for sitemap generation.');
  }

  return normalizeSiteUrl(siteUrl);
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildSitemapXml(paths, siteUrl) {
  const urls = paths
    .map(routePath => `  <url>\n    <loc>${escapeXml(`${siteUrl}${routePath}`)}</loc>\n  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function main() {
  loadEnvironmentVariables();

  const siteUrl = getSiteUrl();
  const routes = Array.from(new Set(getRoutePaths())).sort((left, right) => left.localeCompare(right));
  const sitemapXml = buildSitemapXml(routes, siteUrl);

  fs.writeFileSync(sitemapOutputPath, sitemapXml);

  process.stdout.write(`Generated sitemap with ${routes.length} routes at ${sitemapOutputPath}\n`);
}

main();
