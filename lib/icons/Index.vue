<script setup lang="ts">
import { shallowRef, watch, type Component } from 'vue'
import './index.scss'
import aspComp from './file-ext/Asp.vue'
import aspxComp from './file-ext/Aspx.vue'
import batComp from './file-ext/Bat.vue'
import cComp from './file-ext/C.vue'
import cheaderComp from './file-ext/Cheader.vue'
import cppComp from './file-ext/Cpp.vue'
import cppheaderComp from './file-ext/Cppheader.vue'
import cpythonComp from './file-ext/Cpython.vue'
import configComp from './file-ext/Config.vue'
import csharpComp from './file-ext/Csharp.vue'
import cssComp from './file-ext/Css.vue'
import cvsComp from './file-ext/Cvs.vue'
import dartlangComp from './file-ext/Dartlang.vue'
import dbComp from './file-ext/Db.vue'
import defaultFileComp from './file-ext/Default.vue'
import dockerComp from './file-ext/Docker.vue'
import erlangComp from './file-ext/Erlang.vue'
import gitComp from './file-ext/Git.vue'
import goComp from './file-ext/Go.vue'
import gradleComp from './file-ext/Gradle.vue'
import groovyComp from './file-ext/Groovy.vue'
import haskellComp from './file-ext/Haskell.vue'
import htmlComp from './file-ext/Html.vue'
import httpComp from './file-ext/Http.vue'
import iniComp from './file-ext/Ini.vue'
import javaComp from './file-ext/Java.vue'
import jarComp from './file-ext/Jar.vue'
import jsComp from './file-ext/Js.vue'
import jsonComp from './file-ext/Json.vue'
import json5Comp from './file-ext/Json5.vue'
import jspComp from './file-ext/Jsp.vue'
import kotlinComp from './file-ext/Kotlin.vue'
import lessComp from './file-ext/Less.vue'
import lnkComp from './file-ext/Lnk.vue'
import logComp from './file-ext/Log.vue'
import lispComp from './file-ext/Lisp.vue'
import luaComp from './file-ext/Lua.vue'
import markdownComp from './file-ext/Markdown.vue'
import mdxComp from './file-ext/Mdx.vue'
import pdfComp from './file-ext/Pdf.vue'
import pythonComp from './file-ext/Python.vue'
import rComp from './file-ext/R.vue'
import reactjsComp from './file-ext/Reactjs.vue'
import reacttsComp from './file-ext/Reactts.vue'
import rubyComp from './file-ext/Ruby.vue'
import rustComp from './file-ext/Rust.vue'
import scalaComp from './file-ext/Scala.vue'
import scssComp from './file-ext/Scss.vue'
import shellComp from './file-ext/Shell.vue'
import sqlComp from './file-ext/Sql.vue'
import svgComp from './file-ext/Svg.vue'
import textComp from './file-ext/Text.vue'
import tomlComp from './file-ext/Toml.vue'
import tsComp from './file-ext/Ts.vue'
import vbComp from './file-ext/Vb.vue'
import vbaComp from './file-ext/Vba.vue'
import vueComp from './file-ext/Vue.vue'
import xmlComp from './file-ext/Xml.vue'
import yamlComp from './file-ext/Yaml.vue'
import zigComp from './file-ext/Zig.vue'
import zipComp from './file-ext/Zip.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default_file',
  },
})
const fileTypeMap = (fileType: string) => {
  let type = fileType.split('_').slice(-1)[0]?.toLowerCase()
  const config: {
    [index: string]: Component
  } = {
    asp: aspComp,
    aspx: aspxComp,
    bat: batComp,
    c: cComp,
    h: cheaderComp,
    cpp: cppComp,
    hpp: cppheaderComp,
    pyx: cpythonComp,
    conf: configComp,
    config: configComp,
    cfg: configComp,
    cs: csharpComp,
    css: cssComp,
    cvs: cvsComp,
    dart: dartlangComp,
    db: dbComp,
    // undefined: defaultFileComp,
    docker: dockerComp,
    erl: erlangComp,
    gitignore: gitComp,
    gitikeep: gitComp,
    go: goComp,
    gradle: gradleComp,
    groovy: groovyComp,
    hs: haskellComp,
    html: htmlComp,
    http: httpComp,
    ini: iniComp,
    java: javaComp,
    jar: jarComp,
    js: jsComp,
    json: jsonComp,
    json5: json5Comp,
    jsp: jspComp,
    kt: kotlinComp,
    kts: kotlinComp,
    less: lessComp,
    lnk: lnkComp,
    log: logComp,
    lisp: lispComp,
    lsp: lispComp,
    lua: luaComp,
    md: markdownComp,
    markdown: markdownComp,
    mdx: mdxComp,
    pdf: pdfComp,
    py: pythonComp,
    r: rComp,
    jsx: reactjsComp,
    tsx: reacttsComp,
    rb: rubyComp,
    rs: rustComp,
    scala: scalaComp,
    scss: scssComp,
    sh: shellComp,
    sql: sqlComp,
    svg: svgComp,
    txt: textComp,
    text: textComp,
    toml: tomlComp,
    ts: tsComp,
    vb: vbComp,
    vba: vbaComp,
    vue: vueComp,
    xml: xmlComp,
    yaml: yamlComp,
    yml: yamlComp,
    zig: zigComp,
    zip: zipComp,
  }
  return config[type] ? config[type] : defaultFileComp
}
const svg = shallowRef(fileTypeMap(props.type))
watch(
  () => props.type,
  (n) => {
    svg.value = fileTypeMap(n)
  }
)
</script>

<template>
  <!--<img :src="imgSrc" @error="handleError" class="monaco-tree-editor-icons" />-->
  <component :is="svg" class="monaco-tree-editor-icons" />
</template>
