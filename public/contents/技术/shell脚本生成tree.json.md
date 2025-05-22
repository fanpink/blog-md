
当然可以！以下是适用于 **Linux/macOS 系统** 的 **Shell 脚本版本**，用于生成与原始 JavaScript/Python 版本功能一致的嵌套文件树结构。

---

## ✅ 目标

使用 **Bash Shell 脚本**：

- 遍历 `contents` 文件夹
- 递归构建完整的目录结构（包含目录节点和 `.md` 文件）
- 生成 JSON 格式数据并保存为 `config/tree.json`
- 输出格式保持与原始 JS/Python 一致

---

## 📝 限制说明（Shell 的局限性）

虽然 Bash Shell 不是专为处理复杂嵌套结构设计的，但我们可以借助一些技巧来模拟生成 JSON。为了简化逻辑，我们采用如下策略：

- 使用临时文件辅助拼接 JSON。
- 手动拼接字符串，控制缩进和逗号。
- 只保留必要的字段：`name`, `type`, `children` 和 `path`。
- 支持嵌套目录结构。

---

## ✅ Shell 脚本：`generate_tree.sh`

```bash
#!/bin/bash

# 定义路径
CURRENT_DIR=$(pwd)
CONTENTS_PATH="$CURRENT_DIR/contents"
CONFIG_PATH="$CURRENT_DIR/config"

# 创建 config 目录（如果不存在）
mkdir -p "$CONFIG_PATH"

# 输出 JSON 文件路径
OUTPUT_FILE="$CONFIG_PATH/tree.json"

# 初始化临时文件
TEMP_FILE=$(mktemp)
INDENT="  "

# 递归遍历函数
function walk() {
    local dir="$1"
    local depth="$2"
    local parent_name="$3"
    local is_root="$4"

    local current_indent=""
    for ((i=0; i<depth; i++)); do
        current_indent+="$INDENT"
    done

    # 获取当前目录下所有条目，并排序
    local items=()
    while IFS= read -r -d $'\0'; do
        items+=("$REPLY")
    done < <(find "$dir" -maxdepth 1 -mindepth 1 -print0 | sort -z)

    echo "${current_indent}{"
    echo "${current_indent}${INDENT}\"name\": \"$(basename "$dir")\","
    echo "${current_indent}${INDENT}\"type\": \"directory\"," 

    if [ ${#items[@]} -gt 0 ]; then
        echo "${current_indent}${INDENT}\"children\": ["
        local first=true

        for item in "${items[@]}"; do
            if [ -d "$item" ]; then
                if [ "$first" = true ]; then
                    first=false
                else
                    echo "${current_indent}${INDENT}${INDENT}],"
                fi
                walk "$item" $((depth + 1)) "$(basename "$item")" false
                if [ "$first" = false ]; then
                    echo "${current_indent}${INDENT}${INDENT}["
                fi
            elif [[ "$(basename "$item")" == *.md ]]; then
                local relpath="${item#$CURRENT_DIR/}"
                relpath="${relpath#contents/}"

                if [ "$first" = true ]; then
                    first=false
                else
                    echo ","
                fi

                echo -n "${current_indent}${INDENT}${INDENT}{"
                echo "\"name\": \"$(basename "$item")\","
                echo "${INDENT}\"type\": \"file\","
                echo "${INDENT}\"path\": \"$relpath\""
                echo -n "${current_indent}${INDENT}${INDENT}}"
            fi
        done

        if [ "$first" = false ]; then
            echo ""
            echo "${current_indent}${INDENT}${INDENT}]"
        else
            echo "${current_indent}${INDENT}${INDENT}[]"
        fi
    else
        echo "${current_indent}${INDENT}\"children\": []"
    fi

    echo "${current_indent}}"
}

# 开始生成树结构
{
    echo "{"
    echo "  \"name\": \"contents\","
    echo "  \"type\": \"directory\","
    echo "  \"children\": ["
    
    # 处理 contents 下的内容
    first=true
    find "$CONTENTS_PATH" -mindepth 1 -maxdepth 1 | sort | while read -r item; do
        if [ -d "$item" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                echo ","
            fi
            walk "$item" 2 "$(basename "$item")" false
        elif [[ "$(basename "$item")" == *.md ]]; then
            relpath="${item#$CURRENT_DIR/}"
            relpath="${relpath#contents/}"

            if [ "$first" = true ]; then
                first=false
            else
                echo ","
            fi

            echo "    {"
            echo "      \"name\": \"$(basename "$item")\","
            echo "      \"type\": \"file\","
            echo "      \"path\": \"$relpath\""
            echo "    }"
        fi
    done

    if [ "$first" = true ]; then
        echo "    ]"
    else
        echo ""
        echo "  ]"
    fi

    echo "}"
} > "$TEMP_FILE"

# 格式化 JSON（可选）
cat "$TEMP_FILE" | jq '.' > "$OUTPUT_FILE" 2>/dev/null || cp "$TEMP_FILE" "$OUTPUT_FILE"

rm "$TEMP_FILE"

echo "✅ 文件树已成功生成到: $OUTPUT_FILE"
```

---

## 🧪 使用方法（Linux/macOS）

1. 将上述脚本保存为 `generate_tree.sh`
2. 给予执行权限：
   ```bash
   chmod +x generate_tree.sh
   ```
3. 运行脚本：
   ```bash
   ./generate_tree.sh
   ```
4. 查看输出结果：
   ```bash
   cat config/tree.json
   ```

---

## 🔧 依赖说明

- 脚本默认会尝试用 `jq` 对 JSON 做格式化（美观输出），如果没有安装 `jq`，脚本也会直接输出原始 JSON。
- 安装 `jq`（可选）：
  ```bash
  sudo apt install jq     # Debian/Ubuntu
  brew install jq         # macOS
  ```

---

## 📦 示例输入结构

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

## 📄 输出示例片段

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
    },
    ...
  ]
}
```

---

## ✅ 总结

| 功能 | 是否支持 |
|------|----------|
| 遍历目录 | ✅ |
| 筛选 `.md` 文件 | ✅ |
| 生成 JSON | ✅ |
| 完整嵌套目录结构 | ✅ |
| Linux 兼容 | ✅ |
| macOS 兼容 | ✅ |

---

如你希望加入更多功能，比如排除某些文件、添加元信息、按字母顺序排列等，欢迎继续提问，我可以帮你扩展这个脚本 😊