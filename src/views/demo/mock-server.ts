import { type Files } from '../../../lib'

const fileSeparator = '\\'
let responseFiles: Files = {
  'F:\\test_project\\test1.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test2.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test3.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test4.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test5.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test6.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test7.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test8.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test9.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\test10.html': {
    isFile: true,
    content: '<html><body><h1>Hello World!</h1></body></html>',
  },
  'F:\\test_project\\components': {
    isFolder: true,
  },
  'F:\\test_project\\index.ts': {
    isFile: true,
    content: 'console.log("index")',
  },
  'F:\\test_project\\api\\TestApi.ts': {
    isFile: true,
    content: 'console.log("TestApi")',
  },
  'F:\\test_project\\dto\\TestDto.ts': {
    isFile: true,
    content: 'console.log("TestDto")',
  },
  'F:\\test_project\\package.json': {
    isFile: true,
    content: `{
  "name": "test_project",
  "version": "1.0.0",
  "description": "test project",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "serve": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
`,
  },
  'F:\\test_project\\custom-language.restl': {
    isFile: true,
    content: `namespace java com.github.alphafoxz.oneboot.app.gen.restl.apis
namespace ts gen.app.apis

import "../dtos/AppTestDto.restl"

//本api为自动生成代码，请勿修改

/*测试API*/
@uri(/app/test)
interface AppTestApi {
    /*查询单条*/
    @getUri(/query/{id})
    AppTestDto.AppTestInfoDto queryOne(/*主键*/ long id)
    /*分页*/
    @page
    @getUri(/queryPage/{pageNum}/{pageSize})
    AppTestDto.AppTestInfoDto queryPage(/*页码*/ int pageNum, /*每页数据量*/ int pageSize)
    /*更新*/
    @postUri(/update)
    boolean update(/*更新参数*/ AppTestDto.AppTestInfoDto param)
    /* 测试下载功能 */
    @getUri(/download)
    list<byte> download(/*模块名称*/i64 id)
    /* 测试上传功能 */
    @formData
    @postUri(/upload)
    void upload(/*上传文件*/list<binary> file, /*名称*/string name)
}
`,
  },
}
// 模拟延迟，测试健壮性 mock delay to test robustness
export const delay = async (maxMs = 3000) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, Math.random() * maxMs)
  })
}
export const fetchFiles = async () => {
  await delay(1000)
  return await JSON.parse(JSON.stringify(responseFiles))
}
export const createOrSaveFile = async (path: string, content: string) => {
  await delay()
  if (responseFiles[path]) {
    if (!responseFiles[path].isFile) {
      throw new Error(`save file:[ ${path} ] is not a file!`)
    }
    responseFiles[path].content = content
  } else {
    responseFiles[path] = {
      isFile: true,
      content,
    }
  }
}
export const newFile = async (path: string) => {
  await delay()
  if (responseFiles[path]) {
    throw new Error(`new file: [ ${path} ] already exists!`)
  }
  responseFiles[path] = {
    isFile: true,
    content: '',
  }
}
export const newFolder = async (path: string) => {
  await delay()
  if (responseFiles[path]) {
    throw new Error(`new folder: [ ${path} ] already exists!`)
  }
  responseFiles[path] = {
    isFolder: true,
  }
}
export const rename = async (path: string, newPath: string) => {
  await delay()
  if (!responseFiles[path]) {
    throw new Error(`rename: source file/folder name [ ${path} ] not exists!`)
  } else if (responseFiles[newPath]) {
    throw new Error(`rename: target file/folder name [ ${newPath} ] already exists!`)
  }
  responseFiles[newPath] = responseFiles[path]
  if (path !== newPath) {
    delete responseFiles[path]
  }
  return true
}
export const deleteFile = async (path: string) => {
  await delay()
  if (!responseFiles[path]) {
    throw new Error(`delete: file name [ ${path} ] not exists!`)
  }
  delete responseFiles[path]
  return true
}
