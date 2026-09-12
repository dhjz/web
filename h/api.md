# 启动云原生开发。Start cloud-native development.

`POST /{repo}/-/workspace/start`

已存在环境则直接打开，否则重新创建。
If the environment already exists, open it directly; otherwise, recreate it.
Opens existing env or creates a new one.
访问令牌调用此接口需包含以下权限。Required permissions for access token. 
repo-cnb-trigger:rw

## Request

### Path Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| repo | string | Yes | 仓库完整路径。Full repository path. |

### Request Body

启动工作空间参数。StartWorkspace params.

#### application/json

```json
{
  "type": "object",
  "properties": {
    "branch": {
      "description": "分支名或 tag 名，例如：main 或 v1.0.0。Branch or tag name, e.g. \"main\" or \"v1.0.0\".",
      "type": "string"
    },
    "ref": {
      "description": "Git ref，如 refs/heads/main 或 refs/tags/v1.0.0。Git ref, e.g. refs/heads/main or refs/tags/v1.0.0.",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "x-stoplight": {
    "id": "21c7255d9f683"
  }
}
```

## Responses

### 200

OK

### Body

#### application/vnd.cnb.api+json

```json
{
  "type": "object",
  "properties": {
    "buildLogUrl": {
      "description": "仅新创建开发环境时返回，表示创建开发环境的流水线日志地址。Pipeline log URL, only returned when newly created.",
      "type": "string"
    },
    "message": {
      "description": "仅新创建开发环境时返回，表示创建开发环境的提示信息。Prompt message, only returned when newly created.",
      "type": "string"
    },
    "sn": {
      "description": "仅新创建开发环境时返回，表示创建开发环境的流水线 sn。Pipeline SN, only returned when a new dev environment is created.",
      "type": "string"
    },
    "url": {
      "description": "有环境返回 WebIDE url，否则返回启动 loading 页。WebIDE URL if env exists, else loading page.",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "x-stoplight": {
    "id": "41df1dc84ebc3"
  }
}
```


# 获取云原生开发地址。Get workspace access URL.

`GET /{repo}/-/workspace/detail/{sn}`

根据流水线 SN 查询云原生开发环境的访问地址。
Query the workspace access URL by pipeline SN.
访问令牌调用此接口需包含以下权限。Required permissions for access token. 
repo-cnb-detail:r

## Request

### Path Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| repo | string | Yes | 仓库路径。Repo path. |
| sn | string | Yes | 构建号。SN. |

## Responses

### 200

OK

### Body

#### application/vnd.cnb.api+json

```json
{
  "type": "object",
  "properties": {
    "antigravity": {
      "description": "Antigravity 客户端 remote-ssh schema。Antigravity client remote-ssh schema.",
      "type": "string"
    },
    "codebuddy": {
      "description": "CodeBuddy 国际版 remote-ssh schema。CodeBuddy international remote-ssh schema.",
      "type": "string"
    },
    "codebuddycn": {
      "description": "CodeBuddy 国内版 remote-ssh schema。CodeBuddy CN remote-ssh schema.",
      "type": "string"
    },
    "codebuddyweb": {
      "description": "CodeBuddy Web 访问 url。CodeBuddy Web access URL.",
      "type": "string"
    },
    "cursor": {
      "description": "Cursor 客户端 remote-ssh 访问 schema 地址。Cursor client remote-ssh access schema address.",
      "type": "string"
    },
    "jetbrains": {
      "description": "JetBrains IDE 的 gateway schema。JetBrains IDEs gateway schema.",
      "type": "object",
      "additionalProperties": {
        "type": "string"
      }
    },
    "jumpUrl": {
      "description": "选择入口页面 url。Entry page URL.",
      "type": "string"
    },
    "qoder": {
      "description": "Qoder 客户端 remote-ssh 访问 schema 地址。Qoder client remote-ssh access schema address.",
      "type": "string"
    },
    "remoteSsh": {
      "description": "remote-ssh 连接地址。Remote-ssh connection address.",
      "type": "string"
    },
    "ssh": {
      "description": "ssh 登录命令。SSH login command.",
      "type": "string"
    },
    "trae": {
      "description": "Trae 国际版 remote-ssh schema。Trae international remote-ssh schema.",
      "type": "string"
    },
    "trae-cn": {
      "description": "Trae 国内版 remote-ssh schema。Trae CN remote-ssh schema.",
      "type": "string"
    },
    "vscode": {
      "description": "VSCode 客户端 remote-ssh 访问 schema 地址。VSCode client remote-ssh access schema address.",
      "type": "string"
    },
    "vscode-insiders": {
      "description": "VSCode 预览版 remote-ssh schema。VSCode Insiders remote-ssh schema.",
      "type": "string"
    },
    "webide": {
      "description": "WebIDE 访问 url。WebIDE access URL.",
      "type": "string"
    },
    "windsurf": {
      "description": "Windsurf 客户端 remote-ssh schema。Windsurf client remote-ssh schema.",
      "type": "string"
    },
    "windsurf-next": {
      "description": "Windsurf 预览版 remote-ssh schema。Windsurf Next remote-ssh schema.",
      "type": "string"
    },
    "zed": {
      "description": "Zed 客户端 ssh 访问 schema 地址。Zed client ssh access schema address.",
      "type": "string"
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#",
  "x-stoplight": {
    "id": "b4587bbbd4dea"
  }
}
```