import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'

const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
const limits = {
  initialJavaScriptGzip: 150 * 1024,
  initialCssGzip: 55 * 1024,
  pwaPrecache: 1.5 * 1024 * 1024,
}

function localAssetPath(url) {
  const pathname = new URL(url, 'https://budget.invalid').pathname.replace(/^\//, '')
  return join(dist, pathname)
}

function gzipSize(file) {
  return gzipSync(readFileSync(file)).byteLength
}

function initialAssets(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => localAssetPath(match[1]))
}

function allFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? allFiles(path) : [path]
  })
}

function format(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`
}

const html = readFileSync(join(dist, 'index.html'), 'utf8')
const scripts = initialAssets(html, /<script[^>]+src="([^"]+\.js)"/g)
const preloads = initialAssets(html, /<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g)
const styles = initialAssets(html, /<link[^>]+rel="stylesheet"[^>]+href="([^"]+\.css)"/g)
const initialJavaScriptGzip = [...new Set([...scripts, ...preloads])].reduce(
  (total, file) => total + gzipSize(file),
  0,
)
const initialCssGzip = [...new Set(styles)].reduce((total, file) => total + gzipSize(file), 0)

const sw = readFileSync(join(dist, 'sw.js'), 'utf8')
const precacheUrls = [...sw.matchAll(/\{url:"([^"]+)"(?:,revision:[^}]+)?\}/g)].map(
  (match) => match[1],
)
if (precacheUrls.length === 0) {
  throw new Error('Could not inspect the Workbox precache manifest in dist/sw.js')
}

const outputFiles = allFiles(dist)
const outputByPath = new Map(
  outputFiles.map((file) => [file.slice(dist.length + 1).replaceAll('\\', '/'), file]),
)
const pwaPrecache = [...new Set(precacheUrls)].reduce((total, url) => {
  const path = new URL(url, 'https://budget.invalid').pathname.replace(/^\//, '')
  const file = outputByPath.get(path)
  return total + (file ? statSync(file).size : 0)
}, 0)

const results = [
  ['Initial JavaScript (gzip)', initialJavaScriptGzip, limits.initialJavaScriptGzip],
  ['Initial CSS (gzip)', initialCssGzip, limits.initialCssGzip],
  ['PWA precache', pwaPrecache, limits.pwaPrecache],
]

let failed = false
for (const [label, actual, limit] of results) {
  const passed = actual <= limit
  failed ||= !passed
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label}: ${format(actual)} / ${format(limit)}`)
}

if (failed) process.exitCode = 1
