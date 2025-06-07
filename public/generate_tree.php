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

// 添加状态输出的辅助函数
function outputStatus($message, $type = 'info') {
    $color = $type === 'success' ? '#28a745' : ($type === 'error' ? '#dc3545' : '#17a2b8');
    echo "<div style='margin: 10px 0; padding: 10px; background-color: {$color}; color: white; border-radius: 4px;'>{$message}</div>";
    flush();
}

// 修改路径定义部分
$basePath = __DIR__;
$contentsPath = $basePath . '/contents';
$configPath = $basePath . '/config';

// 检查并创建 config 目录
if (!is_dir($configPath)) {
    mkdir($configPath, 0777, true);
    outputStatus("配置目录创建成功：{$configPath}", 'success');
}

// 检查 contents 目录是否存在
if (!is_dir($contentsPath)) {
    outputStatus("错误：contents 目录不存在！", 'error');
    exit();
}
outputStatus("开始扫描目录：{$contentsPath}");

// 构建子目录结构函数
function buildTree($dir, $contentsPath) {
    outputStatus("正在扫描目录：" . basename($dir));

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
$fileCount = 0;
$dirCount = 0;

foreach ($contentsItems as $item) {
    if ($item === '.' || $item === '..') continue;

    $fullPath = $contentsPath . '/' . $item;
    if (is_dir($fullPath)) {
        $tree['children'][] = buildTree($fullPath, $contentsPath);
        $dirCount++;
    } elseif (pathinfo($item, PATHINFO_EXTENSION) === 'md') {
        $relativePath = str_replace($contentsPath . DIRECTORY_SEPARATOR, '', $fullPath);
        $relativePath = str_replace('\\', '/', $relativePath);
        
        $tree['children'][] = [
            'name' => $item,
            'type' => 'file',
            'path' => $relativePath
        ];
        $fileCount++;
    }
}

outputStatus("目录扫描完成！总计：{$dirCount} 个目录，{$fileCount} 个 Markdown 文件", 'success');

// 写入 JSON 文件
$outputFile = $configPath . '/tree.json';
try {
    if (file_put_contents($outputFile, json_encode($tree, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE))) {
        outputStatus("文件树已成功写入：{$outputFile}", 'success');
    } else {
        outputStatus("写入文件失败！", 'error');
    }
} catch (Exception $e) {
    outputStatus("写入文件时发生错误：" . $e->getMessage(), 'error');
}

// 修改完成跳转代码
echo "<script>
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 5000); // 延长等待时间到3秒
</script></body></html>";