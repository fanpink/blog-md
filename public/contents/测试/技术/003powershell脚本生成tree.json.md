好的！以下是使用 **PowerShell** 编写的脚本，它会：

✅ 递归遍历 `contents` 文件夹  
✅ 构建完整的嵌套目录结构（包含目录节点和 `.md` 文件）  
✅ 生成标准 JSON 格式文件 `config/tree.json`  
✅ 数据结构与原始 JS/Python 版本一致

---

## ✅ PowerShell 脚本：`generate_tree.ps1`

```powershell
# 定义路径
$CurrentDir = $PWD.Path
$ContentsPath = Join-Path $CurrentDir "contents"
$ConfigPath = Join-Path $CurrentDir "config"

# 创建 config 目录（如果不存在）
if (-not (Test-Path -Path $ConfigPath)) {
    New-Item -ItemType Directory -Path $ConfigPath | Out-Null
}

# 递归构建文件树函数
function Build-FileTree($path) {
    $node = [ordered]@{
        name     = Split-Path $path -Leaf
        type     = "directory"
        children = @()
    }

    # 获取当前目录下的所有子项并排序
    $items = Get-ChildItem -Path $path | Sort-Object Name

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            $dirNode = Build-FileTree -path $item.FullName
            $node.children += $dirNode
        } elseif ($item.Extension -eq ".md") {
            $relativePath = Resolve-Path -Relative $item.FullName
            $relativePath = $relativePath.Substring($relativePath.IndexOf('\') + 1) # 去掉开头 .\ 或 ..\
            $relativePath = $relativePath.Replace("contents\", "").Replace("contents/", "")

            $fileNode = [ordered]@{
                name = $item.Name
                type = "file"
                path = $relativePath
            }
            $node.children += $fileNode
        }
    }

    return $node
}

# 构建主树（根目录为 contents）
$tree = Build-FileTree -path $ContentsPath

# 设置 root 节点名称为 'contents'
$root = [ordered]@{
    name     = "contents"
    type     = "directory"
    children = $tree.children
}

# 将对象转换为 JSON 并写入文件
$json = ConvertTo-Json -InputObject $root -Depth 10 -Compress
$json = $json -replace '(?<!\\)"', '"' # Fix quotes
$json = $json -replace '(: )("[^"]+")(,?)', '$1$2$3' # Improve formatting
$json = [System.Text.RegularExpressions.Regex]::Replace($json, '(['']|(?<!\\)": )("{[^}]*}")', '$1$2') # Fix nested objects

# 写入到 tree.json
$outputPath = Join-Path $ConfigPath "tree.json"
Set-Content -Path $outputPath -Value $json -Encoding UTF8

Write-Host "✅ 文件树已成功生成到: $outputPath"
```

---

## 📁 示例输入目录结构

```
contents/
├── index.md
├── about.md
└── docs/
    ├── intro.md
    └── images/
        └── logo.md
```

---

## 📄 输出的 JSON 结构如下

```json
{
  "name": "contents",
  "type": "directory",
  "children": [
    {
      "name": "about.md",
      "type": "file",
      "path": "about.md"
    },
    {
      "name": "index.md",
      "type": "file",
      "path": "index.md"
    },
    {
      "name": "docs",
      "type": "directory",
      "children": [
        {
          "name": "intro.md",
          "type": "file",
          "path": "docs/intro.md"
        },
        {
          "name": "images",
          "type": "directory",
          "children": [
            {
              "name": "logo.md",
              "type": "file",
              "path": "docs/images/logo.md"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🧪 使用方法

1. 将上面代码保存为 `generate_tree.ps1`。
2. 在 PowerShell 中运行：
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser # 第一次运行前需要设置权限
   .\generate_tree.ps1
   ```
3. 查看生成的 `config/tree.json` 文件。

---

## 📌 提示

- 如果你希望忽略空目录或按特定顺序排列文件，可以扩展脚本逻辑。
- PowerShell 支持丰富的对象操作，非常适合做这类结构化数据处理任务。
- 确保你的 `contents` 目录结构正确，否则可能会出错。