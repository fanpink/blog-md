<?php
echo "当前运行 PHP 的用户是：" . shell_exec('whoami');
// 输出简单的欢迎信息
echo "🎉 你好，PHP 正在运行！<br>";

// 使用 phpinfo() 显示当前 PHP 配置信息
echo "<h2>🔧 PHP 配置详情：</h2>";
phpinfo();
?>