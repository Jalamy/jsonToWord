const officegen = require('officegen')
const fs = require('fs')

// Create an empty Word object:
let docx = officegen('docx')

// Officegen calling this function after finishing to generate the docx document:
docx.on('finalize', function (written) {
  console.log(
    'Finish to create a Microsoft Word document.'
  )
})

// Officegen calling this function to report errors:
docx.on('error', function (err) {
  console.log(err)
})

const fontFamily = "Arial"
const color85 = "262626"
const size = (size) => size

const pageTitleOpt = {
  color: color85,
  font_size: size(24),
  fontFamily,
  bold: true
}

const moduleTitleOpt = {
  color: color85,
  font_size: size(20),
  fontFamily,
  bold: true
}

const paraTitle = {
  color: color85,
  font_size: size(16),
  fontFamily,
  bold: true
}

const paraText = {
  color: color85,
  font_size: size(14),
  fontFamily
}

const jsonToString = (json) => JSON.stringify(json, undefined, 2)

const docData = json()

const { 
  host,
  basePath,
  info: { title, description, version },
  interfaces,
  errorCode
} = docData

const data = []

data.push([
  {
    type: "text",
    val: title,
    opt: pageTitleOpt
  }, {
    type: "linebreak"
  },{
    type: "text",
    val: `v${version}`,
    opt: paraText
  }, {
    type: "linebreak"
  }, {
    type: "text",
    val: `Base URL: ${host}${basePath}`,
    opt: paraText
  }, {
    type: "linebreak"
  },{
    type: "text",
    val: description,
    opt: paraText
  }, {
    type: "linebreak"
  }
])

if (interfaces.length) {
  let dataBuff = []
  for (const item of interfaces) {
    if (item.children.length) {
      dataBuff = dataBuff.concat(item.children)
    }
  }

  for (const item of dataBuff) {
    const {
      hash,
      title,
      method,
      path,
      responses,
      parameters,
      response_description
    } = item

    const parametersData = []
    const resDesData = []

    if (parameters.length) {
      for (const i of parameters) {
        parametersData.push(
          {
            type: "text",
            val: `    ${i.name}${i.required ? '' : ' ? '}: <${i.type}> ${i.description}`,
            opt: paraText
          }, {
            type: "linebreak"
          }
        )
      }
    }

    if (response_description.length) {
      for (const i of response_description) {
        resDesData.push({
            type: "text",
            val: `    ${i.name}: ${i.description}`,
            opt: paraText
          },{
            type: "linebreak"
          })
      }
    }

    data.push([
      {
        type: "text",
        val: title,
        opt: moduleTitleOpt
      }, {
        type: "linebreak"
      },{
        type: "text",
        val: "URL:",
        opt: paraTitle
      }, {
        type: "linebreak"
      },{
        type: "text",
        val: `    ${method.toUpperCase()}  ${path}`,
        opt: paraText
      }, {
        type: "linebreak"
      },{
        type: "text",
        val: "Parameter:",
        opt: paraTitle
      }, {
        type: "linebreak"
      },
      ...parametersData,
      {
        type: "text",
        val: "Response:",
        opt: paraTitle
      }, {
        type: "linebreak"
      },{
        type: "text",
        val: jsonToString(responses.success.example),
        opt: paraText
      }, {
        type: "linebreak"
      },{
        type: "text",
        val: "Response_Description:",
        opt: paraTitle
      }, {
        type: "linebreak"
      },
      ...resDesData, 
      {
        type: "linebreak"
      }
    ])
  }
}

if (Object.keys(errorCode).length) {
  const {
    title,
    description,
    dataSource
  } = errorCode

  const tables = []

  const tableHead = [
    [{
      val: "错误码",
      opts: {
        cellColWidth: 4261,
        b: true,
        color: color85,
        sz: size(24),
        fontFamily
      }
    }, {
      val: "含义",
      opts: {
        b: true,
        color: color85,
        align: "left",
        fontFamily
      }
    }],
  ]
  
  const tableStyle = {
    tableColWidth: 4261,
    tableSize: size(24),
    // tableColor: "ada",
    tableAlign: "left",
    tableFontFamily: fontFamily
  }


  if (dataSource && dataSource.length) {
    for (const item of dataSource) {
      const table = [].concat(tableHead)
      if (item.dataSource.length) {
        for (const i of item.dataSource) {
          table.push([String(i.code), i.meaning])
        }
      }
      
      tables.push({
        type: "text",
        val: `${item.code} ${item.meaning}`,
        opt: paraText
      }, {
        type: "table",
        val: table,
        opt: tableStyle
      }, {
        type: "linebreak"
      })
    }
  }

  data.push({
    type: "text",
    val: title,
    opt: moduleTitleOpt
  },{
    type: "text",
    val: description,
    opt: paraText
  },
  ...tables
  )
}

docx.createByJson(data);

let out = fs.createWriteStream(`./words/example${new Date().getTime()}.docx`)

out.on('error', function (err) {
  console.log(err)
})

// Async call to generate the output file:
docx.generate(out)

function json() {
  return {
    "info": {
      "title": "万能胶囊",
      "version": "1.0.0",
      "description": "小程序万能胶囊的后台接口"
    },
    "host": "https://www.jalamy.cn:3000",
    "basePath": "/v1",
    "interfaces": [
      {
        "key": "song",
        "title": "歌曲相关接口",
        "children": [{
            "key": "/song",
            "title": "获取歌曲列表",
            "path": "/song",
            "method": "get",
            "description": "获取接口分页列表",
            "parameters": [{
                "name": "page",
                "in": "query",
                "description": "页码",
                "required": true,
                "type": "number"
              },
              {
                "name": "pageSize",
                "in": "query",
                "description": "每页数据的条数",
                "required": true,
                "type": "number"
              }
            ],
            "responses": {
              "success": {
                "type": "object",
                "example": {
                  "pages": 3,
                  "count": 30,
                  "list": [{
                      "song_id": 7149583,
                      "name": "告白气球",
                      "url": "http://47.107.229.37:8081/gm/music/336/555949/gaobaiqiqiu.mp3",
                      "artist": "周杰伦",
                      "pic120": "http://img2.kuwo.cn/star/albumcover/120/64/39/3540704654.jpg",
                      "pic": "http://img2.kuwo.cn/star/albumcover/300/64/39/3540704654.jpg",
                      "album_name": "周杰伦的床边故事"
                    },
                    {
                      "song_id": 76323299,
                      "name": "说好不哭 (with 五月天阿信)",
                      "url": "http://47.107.229.37:8081/gm/music/336/10685968/shuohaobuku.mp3",
                      "artist": "周杰伦",
                      "pic120": "http://img1.kuwo.cn/star/albumcover/120/12/37/4156270827.jpg",
                      "pic": "http://img1.kuwo.cn/star/albumcover/300/12/37/4156270827.jpg",
                      "album_name": "说好不哭 (with 五月天阿信)"
                    }
                  ]
                }
              }
            },
            "response_description": [
              {
                "name": "song_id",
                "description": "歌曲id"
              },
              {
                "name": "name",
                "description": "歌曲名称"
              },
              {
                "name": "url",
                "description": "歌曲链接"
              },
              {
                "name": "artist",
                "description": "演唱者"
              },
              {
                "name": "pic",
                "description": "歌曲封面图片"
              },
              {
                "name": "album_name",
                "description": "专辑名称"
              }
            ] 
          },
          {
            "key": "/song/singer",
            "title": "通过歌手id查询歌手的歌曲信息",
            "path": "/song/singer",
            "method": "get",
            "description": "通过歌手id查询歌手的歌曲信息",
            "parameters": [{
                "name": "singerId",
                "in": "query",
                "description": "歌手id",
                "required": true,
                "type": "number"
              },
              {
                "name": "page",
                "in": "query",
                "description": "页码",
                "required": true,
                "type": "number"
              },
              {
                "name": "pageSize",
                "in": "query",
                "description": "每页数据的条数",
                "required": true,
                "type": "number"
              }
            ],
            "responses": {
              "success": {
                "type": "array",
                "example": [{
                    "id": 1,
                    "album_id": 1286,
                    "album_name": "Jay",
                    "singer_id": 336,
                    "pic120": "http://img3.kuwo.cn/star/albumcover/120/81/79/2995200746.jpg",
                    "pic": "http://img3.kuwo.cn/star/albumcover/300/81/79/2995200746.jpg",
                    "pub_time": "2000-11-07",
                    "abstract": null
                  },
                  {
                    "id": 2,
                    "album_id": 1287,
                    "album_name": "范特西",
                    "singer_id": 336,
                    "pic120": "http://img4.kuwo.cn/star/albumcover/120/14/76/860786194.jpg",
                    "pic": "http://img4.kuwo.cn/star/albumcover/300/14/76/860786194.jpg",
                    "pub_time": "2001-09-20",
                    "abstract": null
                  }
                ]
              }
            },
            "response_description": [
              {
                "name": "album_id",
                "description": "专辑id"
              },
              {
                "name": "album_name",
                "description": "专辑名称"
              },
              {
                "name": "singer_id",
                "description": "歌手id"
              },
              {
                "name": "pic",
                "description": "专辑图片"
              },
              {
                "name": "pub_time",
                "description": "专辑发布时间"
              },
              {
                "name": "abstract",
                "description": "摘要"
              }
            ]
          },
          {
            "key": "/song/song",
            "title": "通过歌曲id获取歌曲信息",
            "path": "/song/song",
            "method": "get",
            "description": "通过歌曲id获取歌曲信息",
            "parameters": [{
              "name": "song_id",
              "in": "query",
              "description": "歌曲id",
              "required": true,
              "type": "number"
            }],
            "responses": {
              "success": {
                "type": "array",
                "example": [{
                  "name": "告白气球",
                  "url": "http://47.107.229.37:8081/gm/music/336/555949/gaobaiqiqiu.mp3",
                  "popular": 19,
                  "artist": "周杰伦",
                  "album": "周杰伦的床边故事",
                  "pic": "http://img2.kuwo.cn/star/albumcover/120/64/39/3540704654.jpg"
                }]
              }
            },
            "response_description": [
              {
                "name": "name",
                "description": "歌曲名称"
              },
              {
                "name": "url",
                "description": "歌曲链接"
              },
              {
                "name": "popular",
                "description": "歌曲热度"
              },
              {
                "name": "artist",
                "description": "演唱者"
              },
              {
                "name": "album",
                "description": "所属专辑"
              },
              {
                "name": "pic",
                "description": "歌曲图片"
              }
            ]
          },
          {
            "key": "/song/hot",
            "title": "歌曲热门搜索",
            "path": "/song/hot",
            "method": "get",
            "description": "歌曲热门搜索",
            "parameters": [],
            "responses": {
              "success": {
                "type": "array",
                "example": [{
                    "name": "周杰伦",
                    "popular": 37
                  },
                  {
                    "name": "告白气球",
                    "popular": 20
                  },
                  {
                    "name": "说好不哭 (with 五月天阿信)",
                    "popular": 6
                  }
                ]
              }
            },
            "response_description": [
              {
                "name": "name",
                "description": "热门搜索名称"
              },
              {
                "name": "popular",
                "description": "热度"
              }
            ]
          },
          {
            "key": "/song/albumInfo",
            "title": "通过专辑id获取专辑信息",
            "path": "/song/albumInfo",
            "method": "get",
            "description": "通过专辑id获取专辑信息",
            "parameters": [{
              "name": "album_id",
              "in": "query",
              "description": "专辑id",
              "required": true,
              "type": "number"
            }],
            "responses": {
              "success": {
                "type": "object",
                "example": {
                  "album_name": "Jay",
                  "album_pic": "http://img3.kuwo.cn/star/albumcover/300/81/79/2995200746.jpg",
                  "abstract": null,
                  "singer_name": "周杰伦",
                  "singer_pic": "https://y.gtimg.cn/music/photo_new/T001R150x150M0000025NhlN2yWrP4.jpg"
                }
              }
            },
            "response_description": [
              {
                "name": "album_name",
                "description": "专辑名称"
              },
              {
                "name": "album_pic",
                "description": "专辑图片"
              },
              {
                "name": "abstract",
                "description": "摘要"
              },
              {
                "name": "singer_name",
                "description": "歌手名称"
              },
              {
                "name": "singer_pic",
                "description": "歌手图片"
              }
            ]
          }
        ]
      },
      {
        "key": "book",
        "title": "书籍相关接口",
        "children": [{
            "key": "/book",
            "title": "获取书籍列表",
            "path": "/book",
            "method": "get",
            "description": "获取书籍列表",
            "parameters": [{
                "name": "page",
                "in": "query",
                "description": "页码",
                "required": true,
                "type": "number"
              },
              {
                "name": "pageSize",
                "in": "query",
                "description": "每页数据的条数",
                "required": true,
                "type": "number"
              },
              {
                "name": "keyword",
                "in": "query",
                "description": "查询关键字",
                "required": false,
                "type": "string"
              }
            ],
            "responses": {
              "success": {
                "type": "array",
                "example": [{
                    "book_id": "003617830ccd4eb1a9eaea82c82e1c6f_4",
                    "title": "乌合之众：群体心理研究",
                    "author": "【法】古斯塔夫·勒庞",
                    "cover": "https://easyreadfs.nosdn.127.net/RNcr-PYaXJMs4CJydTzlZQ==/8796093024634699046",
                    "score": 8,
                    "tags": "社会学,人类学"
                  },
                  {
                    "book_id": "003e7a8164f142c29ebef60a400ec7d6_4",
                    "title": "雪球专刊055期：理财在身边",
                    "author": "雪球",
                    "cover": "https://easyreadfs.nosdn.127.net/RAqlni07PP70846MYlCmmQ==/7917038973359416882",
                    "score": 10,
                    "tags": "杂志,财经,股市,投资"
                  }
                ]
              }
            },
            "response_description": [
              {
                "name": "book_id",
                "description": "书籍id"
              },
              {
                "name": "title",
                "description": "书名"
              },
              {
                "name": "author",
                "description": "作者"
              },
              {
                "name": "cover",
                "description": "封面地址"
              },
              {
                "name": "score",
                "description": "评分"
              },
              {
                "name": "tags",
                "description": "标签"
              }
            ]
          },
          {
            "key": "/book/info",
            "title": "根据书籍id获取书籍详细信息",
            "path": "/book/info",
            "method": "get",
            "description": "根据书籍id获取书籍详细信息",
            "parameters": [{
              "name": "bookId",
              "in": "query",
              "description": "书籍id",
              "required": true,
              "type": "string"
            }],
            "responses": {
              "success": {
                "type": "object",
                "example": {
                  "id": 1,
                  "title": "东洋白话",
                  "author": "黄文炜",
                  "cover": "https://easyreadfs.nosdn.127.net/4l2smGrYojC2Qvwpg72PQQ==/8796093022439326262",
                  "score": 8,
                  "rate_num": 92,
                  "words": 8.4,
                  "clicks": 129.8,
                  "category": "异国文化",
                  "tags": "日本文化",
                  "abstract": "在本书中，知名旅日专栏作家黄文炜以异乡人的视角，对日本的政治、经济、生活、文化等诸多方面作了近距离观察。通过作者客观冷静的笔触，我们可以看到一个更加真实的日本。在许多篇文章中，作者将中国的现状与日本进行对比，点出其中存在的差距。这时的日本就像一面镜子，看见日本可以看到自己的不足，对于认清自我具有十分重要的意义。",
                  "author_des": "黄文炜，著有《东洋白话》。",
                  "popular": 0
                }
              }
            },
            "response_description": [
              {
                "name": "title",
                "description": "书籍名称"
              },
              {
                "name": "author",
                "description": "作者名称"
              },
              {
                "name": "cover",
                "description": "封面图片地址"
              },
              {
                "name": "score",
                "description": "评分"
              },
              {
                "name": "rate_num",
                "description": "打分次数"
              },
              {
                "name": "words",
                "description": "字数"
              },
              {
                "name": "clicks",
                "description": "点击数"
              },
              {
                "name": "category",
                "description": "分类"
              },
              {
                "name": "tags",
                "description": "标签"
              },
              {
                "name": "abstract",
                "description": "摘要"
              },
              {
                "name": "author_des",
                "description": "作者简介"
              },
              {
                "name": "popular",
                "description": "热度"
              }
            ]
          }
        ]
      }
    ],
    "errorCode": {
      "key": "errorCode",
      "title": "错误码",
      "description": "请以错误码来判断具体的错误，不要以文字描述作为判断的依据",
      "dataSource": [
        {
          "code": "100x",
          "meaning": "通用类型",
          "dataSource": [
            {
              "code": 0,
              "meaning": "OK,成功"
            },
            {
              "code": 1000,
              "meaning": "输入参数错误"
            },
            {
              "code": 1001,
              "meaning": "输入的json格式不正确"
            },
            {
              "code": 1002,
              "meaning": "找不到资源"
            },
            {
              "code": 1003,
              "meaning": "未知错误"
            },
            {
              "code": 1004,
              "meaning": "禁止访问"
            },
            {
              "code": 1005,
              "meaning": "不正确的开发者key"
            },
            {
              "code": 1006,
              "meaning": "服务器内部错误"
            }
          ]
        },
        {
          "code": "200x",
          "meaning": "歌曲相关",
          "dataSource": [
            {
              "code": 2000,
              "meaning": "输入参数错误"
            },
            {
              "code": 2001,
              "meaning": "输入的json格式不正确"
            },
            {
              "code": 2002,
              "meaning": "找不到资源"
            },
            {
              "code": 2003,
              "meaning": "未知错误"
            },
            {
              "code": 2004,
              "meaning": "禁止访问"
            },
            {
              "code": 2005,
              "meaning": "不正确的开发者key"
            },
            {
              "code": 2006,
              "meaning": "服务器内部错误"
            }
          ]
        }
      ]
    }
  }
}