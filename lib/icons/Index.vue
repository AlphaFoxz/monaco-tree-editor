<script setup lang="ts">
import { ref, watch } from 'vue'
import './index.scss'
import defaultFileUrl from '/monaco-tree-editor-statics/icons/default_file.svg?url'
import javaUrl from '/monaco-tree-editor-statics/icons/file_type_java.svg?url'
import kotlinUrl from '/monaco-tree-editor-statics/icons/file_type_kotlin.svg?url'
import pythonUrl from '/monaco-tree-editor-statics/icons/file_type_python.svg?url'
import cUrl from '/monaco-tree-editor-statics/icons/file_type_c.svg?url'
import cheaderUrl from '/monaco-tree-editor-statics/icons/file_type_cheader.svg?url'
import cppUrl from '/monaco-tree-editor-statics/icons/file_type_cpp.svg?url'
import csharpUrl from '/monaco-tree-editor-statics/icons/file_type_csharp.svg?url'
import rustUrl from '/monaco-tree-editor-statics/icons/file_type_rust.svg?url'
import vueUrl from '/monaco-tree-editor-statics/icons/file_type_vue.svg?url'
import batUrl from '/monaco-tree-editor-statics/icons/file_type_bat.svg?url'
import shellUrl from '/monaco-tree-editor-statics/icons/file_type_shell.svg?url'
import luaUrl from '/monaco-tree-editor-statics/icons/file_type_lua.svg?url'
import jsUrl from '/monaco-tree-editor-statics/icons/file_type_js.svg?url'
import tsUrl from '/monaco-tree-editor-statics/icons/file_type_typescript.svg?url'
import tsxUrl from '/monaco-tree-editor-statics/icons/file_type_reactts.svg?url'
import jsxUrl from '/monaco-tree-editor-statics/icons/file_type_reactjs.svg?url'
import htmlUrl from '/monaco-tree-editor-statics/icons/file_type_html.svg?url'
import cssUrl from '/monaco-tree-editor-statics/icons/file_type_css.svg?url'
import lessUrl from '/monaco-tree-editor-statics/icons/file_type_less.svg?url'
import jsonUrl from '/monaco-tree-editor-statics/icons/file_type_json.svg?url'
import json5Url from '/monaco-tree-editor-statics/icons/file_type_json5.svg?url'
import svgUrl from '/monaco-tree-editor-statics/icons/file_type_svg.svg?url'
import dockerUrl from '/monaco-tree-editor-statics/icons/file_type_docker.svg?url'
import sqlUrl from '/monaco-tree-editor-statics/icons/file_type_sql.svg?url'
import tomlUrl from '/monaco-tree-editor-statics/icons/file_type_toml.svg?url'
import xmlUrl from '/monaco-tree-editor-statics/icons/file_type_xml.svg?url'
import yamlUrl from '/monaco-tree-editor-statics/icons/file_type_yaml.svg?url'
import markdownUrl from '/monaco-tree-editor-statics/icons/file_type_markdown.svg?url'
import git2Url from '/monaco-tree-editor-statics/icons/file_type_git2.svg?url'
import iniUrl from '/monaco-tree-editor-statics/icons/file_type_ini.svg?url'
import gradleUrl from '/monaco-tree-editor-statics/icons/file_type_gradle.svg?url'
import httpUrl from '/monaco-tree-editor-statics/icons/file_type_http.svg?url'
import dbUrl from '/monaco-tree-editor-statics/icons/file_type_db.svg?url'

const props = defineProps({
  type: {
    type: String,
    default: 'default_file',
  },
})
const fileTypeMap = (fileType: string): string => {
  const type = fileType.split('_').slice(-1)[0]
  const config: {
    [index: string]: string
  } = {
    java: javaUrl,
    kt: kotlinUrl,
    kts: kotlinUrl,
    py: pythonUrl,
    c: cUrl,
    h: cheaderUrl,
    cpp: cppUrl,
    cs: csharpUrl,
    rs: rustUrl,
    vue: vueUrl,
    bat: batUrl,
    sh: shellUrl,
    lua: luaUrl,
    ts: tsUrl,
    js: jsUrl,
    tsx: tsxUrl,
    jsx: jsxUrl,
    html: htmlUrl,
    css: cssUrl,
    less: lessUrl,
    json: jsonUrl,
    json5: json5Url,
    svg: svgUrl,
    docker: dockerUrl,
    sql: sqlUrl,
    toml: tomlUrl,
    xml: xmlUrl,
    yaml: yamlUrl,
    yml: yamlUrl,
    md: markdownUrl,
    markdown: markdownUrl,
    gitignore: git2Url,
    ini: iniUrl,
    gradle: gradleUrl,
    http: httpUrl,
    db: dbUrl,
  }
  return config[type] ? config[type] : fileType
}
const imgSrc = ref(fileTypeMap(props.type))
const handleError = () => {
  imgSrc.value = defaultFileUrl
}
watch(
  () => props.type,
  (n) => {
    imgSrc.value = fileTypeMap(n)
  }
)
</script>

<template>
  <img :src="imgSrc" @error="handleError" class="monaco-tree-icons" />
</template>
