<?php

// 设置最大执行时间（防止超时）
set_time_limit(300);

// 禁用输出缓冲并立即刷新，以实现实时输出
ob_implicit_flush(true);
ob_end_flush();

echo "<!DOCTYPE html>
<html lang='zh-CN'>
<head>
    <meta charset='UTF-8'>
    <title>生成文件树中...</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5; }
        .loading { font-size: 18px; color: #333; }
    </style>
</head>
<body>
    <div class='loading'>⏳ 正在生成文件树，请稍候...</div>";

// 刷新输出，确保用户看到提示
flush();

// 定义路径（基于当前脚本所在目录）
$basePath = __DIR__;
$contentsPath = $basePath . '/contents';
$configPath = $basePath . '/config';

// 确保 config 目录存在
if (!is_dir($configPath)) {
    mkdir($configPath, 0777, true);
}

// 构建子目录结构函数
function buildTree($dir, $contentsPath) {
    $node = [
        'name' => basename($dir),
        'type' => 'directory',
        'children' => []
    ];

    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') continue;

        $fullPath = $dir . '/' . $item;
        if (is_dir($fullPath)) {
            $subNode = buildTree($fullPath, $contentsPath);
            if (!empty($subNode)) {
                $node['children'][] = $subNode;
            }
        } elseif (pathinfo($item, PATHINFO_EXTENSION) === 'md') {
            // 获取相对于 contents 的路径
            $relativePath = str_replace($contentsPath . DIRECTORY_SEPARATOR, '', $fullPath);
            $relativePath = str_replace('\\', '/', $relativePath); // 统一为正斜杠路径

            $node['children'][] = [
                'name' => $item,
                'type' => 'file',
                'path' => $relativePath
            ];
        }
    }

    return $node;
}

// 主函数开始构建树
$tree = [
    'name' => 'contents',
    'type' => 'directory',
    'children' => []
];

// 遍历 contents 目录下的所有项目
$contentsItems = scandir($contentsPath);
foreach ($contentsItems as $item) {
    if ($item === '.' || $item === '..') continue;

    $fullPath = $contentsPath . '/' . $item;
    if (is_dir($fullPath)) {
        $tree['children'][] = buildTree($fullPath, $contentsPath);
    } elseif (pathinfo($item, PATHINFO_EXTENSION) === 'md') {
        $relativePath = str_replace($contentsPath . DIRECTORY_SEPARATOR, '', $fullPath);
        $relativePath = str_replace('\\', '/', $relativePath); // 统一为正斜杠路径

        $tree['children'][] = [
            'name' => $item,
            'type' => 'file',
            'path' => $relativePath
        ];
    }
}

// 写入 JSON 文件（注意这里加入了 JSON_UNESCAPED_UNICODE）
$outputFile = $configPath . '/tree.json';
file_put_contents($outputFile, json_encode($tree, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

// 显示完成信息，并准备跳转
echo "<script>
    document.querySelector('.loading').textContent = '✅ 文件树已生成完毕，即将跳转...';
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1000);
</script></body></html>";