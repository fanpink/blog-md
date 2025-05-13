# 代数公式测试文档

测试Markdown对数学公式和图片的支持情况

## 1. 行内公式测试
当 $a \ne 0$ 时，方程 $ax^2 + bx + c = 0$ 的解为 $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

使用括号语法：当 $\( x + y = z \)$ 时，$\( z^2 = x^2 + y^2 + 2xy \)$

## 2. 块级公式测试
二次方程求根公式：
$$ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} $$

勾股定理：
$\[ a^2 + b^2 = c^2 \]$

## 3. 多行公式环境测试
使用`equation`环境：
$$
\begin{equation}
\sum_{i=1}^n i = \frac{n(n+1)}{2}
\end{equation}
$$

使用`align`环境：
$$
\begin{align}
(a + b)^2 &= a^2 + 2ab + b^2 \\
(a - b)^2 &= a^2 - 2ab + b^2
\end{align}
$$
## 4. 矩阵表示测试
3x3单位矩阵：
$$
I_3 = \begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

## 5. 图片显示测试
本地图片测试：
![代数结构示意图](algebra.jpg)

网络图片测试：
![维基数学图片](https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Linear_subspaces_with_shading.svg/320px-Linear_subspaces_with_shading.svg.png)

## 6. 混合公式与图片
线性变换示例：
$$ T: \mathbb{R}^2 \to \mathbb{R}^2 $$
![线性变换图示](linear_transform.png)

## 7. 参考式图片链接测试
这是图片引用示例[^pic]

[^pic]: ![可交换图表](commutative_diagram.png "可交换图表")

## 兼容性说明
1. 数学公式需要LaTeX支持（推荐使用KaTeX或MathJax）
2. 图片路径需要正确配置
3. 多行公式环境需要启用相应扩展