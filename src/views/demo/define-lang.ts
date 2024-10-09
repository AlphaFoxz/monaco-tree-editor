import { nextTick } from 'vue'

export function registerRestl(monaco: { editor: any; languages: any }) {
  const languages = monaco.languages

  /*
  内置类型
  identifier         entity           constructor
  operators          tag              namespace
  keyword            info-token       type
  string             warn-token       predefined
  string.escape      error-token      invalid
  comment            debug-token
  comment.doc        regexp
  constant           attribute

  delimiter .[curly,square,parenthesis,angle,array,bracket]
  number    .[hex,octal,binary,float]
  variable  .[name,value]
  meta      .[content]
  */
  languages.register({
    id: 'restl',
    aliases: ['restl'],
    extensions: ['.restl'],
    mimetypes: ['text/x-restl', 'text/x-restl-source'],
  })
  languages.setLanguageConfiguration('restl', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['(', ')'],
      ['{', '}'],
      ['[', ']'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '<', close: '>' },
    ],
  })

  languages.setMonarchTokensProvider('restl', {
    keyword: [
      'namespace',
      'import',
      'interface',
      'class',
      'enum',
      'boolean',
      'byte',
      'binary',
      'short',
      'int',
      'long',
      'double',
      'i16',
      'i32',
      'i64',
      'string',
      'list',
      'set',
      'map',
      'void',
    ],
    tokenizer: {
      root: [
        [/\bnamespace\b/, { token: 'keyword', next: '@namespace_body' }],
        [/\bimport\b/, { token: 'keyword', next: '@import_path' }],
        [/\@[a-zA-Z]+/, { token: 'punctuation.definition.annotation.java' }],
        [/\@[a-zA-Z]+(?=[(])/, { token: 'punctuation.definition.annotation.java', next: '@annotation_param' }],
        [/\binterface\b/, { token: 'keyword', next: '@interface' }],
        [/\bclass\b/, { token: 'keyword', next: '@class' }],
        [/\benum\b/, { token: 'keyword', next: '@enum' }],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'punctuation.definition.string.begin', next: '@comment_doc' }],
      ],
      namespace_body: [
        [/[a-zA-Z_\.]+\s*$/, { token: 'namespace', next: '@pop' }],
        [/\b[a-zA-Z]+\b/, 'variable'],
      ],
      import_path: [[/\"[^\"]*\"/, { token: 'string', next: '@pop' }]],
      annotation_param: [
        [/.*[)]/, { token: 'keyword.operator', next: '@pop' }],
        [/[(]/, { token: 'keyword.operator' }],
        [/[a-zA-Z/{}]+/, { token: 'string' }],
      ],
      interface: [
        [/[}]/, { token: 'operator', next: '@pop' }],
        [/[{]/, { token: 'operator', next: '@interface_body' }],
        [/\b[a-zA-Z]+\b/, { token: 'entity.name.class' }],
      ],
      interface_body: [
        [/\@[a-zA-Z]+/, { token: 'punctuation.definition.annotation.java' }],
        [/\@[a-zA-Z]+(?=[(])/, { token: 'punctuation.definition.annotation.java', next: '@annotation_param' }],
        [/(^|\W)(?=[}])/, { token: 'operator', next: '@pop' }],
        [/\b(map|set|list|enum)\b/, { token: 'support.type.builtin.ts', next: '@type_t' }],
        [/\b(i16|i32|i64|short|int|long|double|boolean|string|binary|byte)\b/, { token: 'support.type.builtin.ts' }],
        [/[a-zA-Z]+\.[a-zA-Z]+/, { token: 'entity.name.type' }],
        [/[!|?]/, { token: 'keyword.operator.optional' }],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'punctuation.definition.string.begin', next: '@comment_doc' }],
      ],
      class: [
        [/[}]/, { token: 'operator', next: '@pop' }],
        [/[{]/, { token: 'operator', next: '@class_body' }],
        [/\b[a-zA-Z]+\b/, { token: 'entity.name.class' }],
      ],
      class_body: [
        [/(^|\W)(?=[}])/, { token: 'operator', next: '@pop' }],
        [/\b@[a-zA-Z]+/, { token: 'punctuation.definition.annotation.java', next: '@annotation_param' }],
        [/\b(map|set|list|enum)\b/, { token: 'support.type.builtin.ts', next: '@type_t' }],
        [/\b(i16|i32|i64|short|int|long|double|boolean|string|binary|byte)\b/, { token: 'support.type.builtin.ts' }],
        [/[!|?]/, { token: 'keyword.operator.optional' }],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'punctuation.definition.string.begin', next: '@comment_doc' }],
      ],
      enum: [
        [/[}]/, { token: 'operator', next: '@pop' }],
        [/[{]/, { token: 'operator', next: '@enum_body' }],
        [/\b[a-zA-Z]+\b/, { token: 'entity.name.class' }],
      ],
      enum_body: [
        [/(^|\W)(?=[}])/, { token: 'operator', next: '@pop' }],
        [/[a-zA-Z_]+\s*(?=[=])/, { token: 'constant' }],
        [/(?<=[=])[0-9]*/, { token: 'constant.numeric' }],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'punctuation.definition.string.begin', next: '@comment_doc' }],
      ],
      type: [
        [/\b(map|set|list|enum)\b/, { token: 'support.type.builtin.ts', next: '@type_t' }],
        [
          /\b(i16|i32|i64|short|int|long|double|boolean|string|binary|byte)\b/,
          { token: 'support.type.builtin.ts', next: '@pop' },
        ],
        [/\b[a-zA-Z]+(\.[a-zA-Z]+)?\b/, { token: 'entity.other.inherited-class', next: '@pop' }],
        [/\s/, { token: 'keyword', next: '@pop' }],
      ],
      type_t: [
        [/[>]/, { token: 'operator', next: '@pop' }],
        [/[<]/, { token: 'operator', next: '@type' }],
      ],
      comment_doc: [
        [/\*\//, { token: 'punctuation.definition.string.end', next: '@pop' }],
        [/.*(?=\*\/)/, 'punctuation.definition.string.begin'],
      ],
    },
  })
  monaco.editor.onDidCreateModel((model: any) => {
    if (model.getLanguageId() === 'restl') {
      nextTick(() => {
        model.updateOptions({
          tabSize: 4,
          insertSpaces: true,
          trimAutoWhitespace: true,
        })
      })
    }
  })
}
