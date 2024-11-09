import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()

fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(rootDir, 'dist', 'README.md'))
fs.copyFileSync(path.join(rootDir, 'README.CN.md'), path.join(rootDir, 'dist', 'README.CN.md'))
fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(rootDir, 'dist', 'LICENSE'))
fs.copyFileSync(path.join(rootDir, 'package.publish.json'), path.join(rootDir, 'dist', 'package.json'))

fs.copyFileSync(path.join(rootDir, 'package.publish.json'), path.join(rootDir, 'dist', 'package.json'))
