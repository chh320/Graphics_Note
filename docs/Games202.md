# Games 202

## Real-Time Shadows

### Recap : shadow mapping

#### shadow mapping 是个 2-Pass 算法

1. 由光源出发，生成一个 “depth texture”

   ![image-20221107092503586](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107092503586.png)

2. 由相机出发使用 SM 比较，两者都能看到的点，不在阴影中

   <img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107092530019.png" alt="image-20221107092530019" style="zoom:80%;" />

#### shadow mapping 是一个图像空间的算法

Pro：不需要空间几何的知识

Con：会造成自遮挡和走样问题



### Issues in Shadow Mapping

#### Self occlusion

在例图的地面中出现了大量条形纹理，这就是自遮挡问题

![image-20221107092729513](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107092729513.png)

产生自遮挡的原因：

深度贴图是由像素组成，因而深度贴图所记录的光线到达地面的距离是分段式的，这就导致了前一个像素记录的深度可能对后一个像素存在遮挡，以至于本该是平整的地面却存在自遮挡问题

![image-20221107092815415](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107092815415.png)

##### Adding a (variable) bias to reduce self occlusion

解决办法是为每一个深度增加一个 bias，即忽略掉某一部分深度，从而避免临近像素之间所记录的深度存在遮挡

![image-20221107093318220](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107093318220.png)

但存在一个问题：当bias过大，会导致阴影分离

![image-20221107093557631](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107093557631.png)

##### Second-depth shadow mapping

为了寻找一个合适的bias，以避免阴影分离的问题，存在一种理论性的方法，即二次深度贴图

先记录 front face 的深度贴图，再记录 back face 的深度贴图，对两者求一个平均

Cons：要求 object 是封闭的，且开销较大，需要做两个深度贴图

![image-20221107093636927](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107093636927.png)

##### RTR does not trust in COMPLEXITY

虽然上述的过程都是 O(n) 的复杂度，但RTR不相信时间复杂度，仅相信具体消耗时间

#### Aliasing

对于硬阴影，当采样频率较低容易产生锯齿

![image-20221107094104738](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107094104738.png)



### The math behind shadow mapping

#### Inequalities in Calculus

设 f(x) 和 g(x) 在 [a, b] 上都可积，则

Schwarz 不等式，积分的平方小于平方的积分：
$$
\int_{a}^{b}[f(x)g(x)dx]^2 \leq \int_{a}^{b}f^2(x)dx\cdot\int_{a}^{b}g^2(x)dx
$$
Minkowski 不等式，和的积分小于积分的和：
$$
\{\int_{a}^{b}[f(x) + g(x)]^2dx\}^{\frac{1}{2}}\leq\{{\int_{a}^{b}f^2(x)dx}\}^{\frac{1}{2}} + \{{\int_{a}^{b}g^2(x)dx}\}^{\frac{1}{2}}
$$

#### Approximation in RTR

在 RTR 中，更关注的是近似值
$$
\int_{Ω}f(x)g(x)dx \approx  \frac{\int_{Ω}f(x)dx}{\int_{Ω}dx} \cdot\int_{Ω}g(x)dx
$$

#### In Shadow Mapping

##### Recall: the rendering equation with explicit visibility

对于渲染方程，RTR 引入了一个 Visibility term
$$
L_o(p, w_o) = \int_{Ω_+}L_i(p, w_i)f_r(p, w_i, w_o)cosθ_iV(p, w_i)dw_i
$$
结合上述的近似方程，则容易发现，该方程为一个可见项乘以原本的着色方程
$$
L_o(p, w_o) \approx \frac{\int_{Ω_+}V(p, w_i)dw_i}{\int_{Ω_+}dw_i} \cdot \int_{Ω_+}L_i(p, w_i)f_r(p, w_i, w_o)cosθ_idw_i
$$
该近似成立的条件是（满足其一即可）：

1. Small support（积分域很小，例如镜面光）
2. Smooth integrand（漫反射等平滑过渡的光照区域）



### Percentage closer soft shadows（PCSS）

在shadow mapping中求得的是硬阴影，容易存在锯齿边，但在真实环境下，需要的是软阴影

![image-20221107100227774](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107100227774.png)![image-20221107100235927](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221107100235927.png)

#### Percentage Closer Filtering (PCF)

在介绍 PCSS 之前，需要先介绍下 PCF

PCF 主要对阴影边缘进行了反走样，它的最初目的并不是生成软阴影

PCF 既不是对shadow mapping 进行 filtering，也不是对最终结果进行 filtering，而是对比较的像素结果进行 filtering

##### PCF 的主要步骤是：

1. 生成 shadow mapping
2. 选取一个 shading point，找到它对应在 shadow mapping 上的像素位置
3. 依次比较该像素及其附近一个范围内的所有像素，最后求得一个平均值，作为visibility term

##### 例如，对于一个地板上的点P：

1. 对该黑框划分的范围内（e.g. 3x3)的所有像素依次比较它们和点 P 的深度

2. 获得一个比较结果 e.g.

   ![image-20221107101114798](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107101114798.png)

3. 计算平均值 e.g. 0.667

![image-20221107100652906](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107100652906.png)

##### A Deeper Look at PCF （数学角度）

其中[w * f] 代表卷积 / 过滤的意思，即对每个点做加权平均
$$
[w * f](p) = \sum_{q \in N(p)}w(p, q)f(q)
$$
对于 PCSS，由上式表述，即为
$$
V(x) = \sum_{q \in N(p)}w(p, q) \cdot X^+[D_{SM}(q) - D_{scene}(x)]
$$
![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107102732420.png)

因此，从公式来看，PCF 不是对 shadow map 进行 filtering
$$
V(x) \neq X^+ \{w * D_{SM}(q) - D_{scene}(x)\}
$$
PCF 也不是对结果进行 filtering
$$
V(x) \neq \sum_{q \in N(p)}w(p, q)V(q)
$$

##### Does filtering size matter?

在进行 PCF 的过程中发现，若该 filtering 核较小，获得的阴影更锐利，若核更大，则阴影更柔和

因而想到，是否能控制 filtering 核大小，用 PCF 制作软阴影，即接下来 PCSS 的过程

#### Percentage Closer Soft Shadows

在这样一张图片中，可以看到钢笔的阴影靠近钢笔实体时近乎硬阴影，而远离钢笔的部分则逐渐柔和，因而可以认为阴影的软硬程度是和实体的距离有关

![image-20221107101500003](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107101500003.png)

##### Key conclusion

从示意图可以发现，Wp 决定了进行 PCF 的范围大小，当光源大小一定时，Wp 仅受到 blocker 的距离影响

即，仅需求得 d_Blocker ，就可以得到 PCF 的范围大小
$$
W_{Prenumbra} = (d_{Receiver} - d_{Blocker}) \cdot W_{Light} / d_{Blocker}
$$
![image-20221107101733318](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107101733318.png)

##### The complete algorithm of PCSS

1. Blocker search（获得一个区域范围内的平均blocker深度）
2. Penumbra estimation（使用上述深度，计算filter的大小）
3. PCF

##### Which region (on the shadow map) to perform blocker search

现在有了一个新的问题，那么在SM上该选取多大的范围进行 Blocker search 呢

一个比较好的办法是从 shading point 出发，与光源边缘连线，在 SM 上划分一个范围，只有该范围是有可能存在Blocker 对 shading point 进行遮挡的

![image-20221107102417030](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107102417030.png)

##### 小结：PCSS 是一种自适应filter大小的PCF算法



### Variance Soft Shadow Mapping

在PCSS 过程中，容易发现第一步 Blocker search 和第三步 PCF 需要搜索一个区域内的每一个 texel，开销巨大

为此引入VSSM，希望避免耗时的采样过程

#### for Step 3：PCF

##### Let’s think from “percentage closer” filtering

对于filtering步骤，可以这么考虑：

我们依次比较着色点和所有的临近像素的深度，目的是为了知道有百分之多少的texel是比着色点深度更近

换言之，就好像想知道一个学生的成绩在班里面排名多少一样

那么，并不需要准确计算有多少人，只要知道这个成绩的分布函数，即可知道某一个成绩所在的大致排名位置，从而避免了逐个采样

##### Key idea

假设这个成绩的分布符合正态分布，**那么事实上，只要计算这个分布的均值和方差，即可记录一个分布**

![image-20221107104344006](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107104344006.png)

##### Mean (average)

均值（期望）的计算有个很好的方法，就是 **mipmap**，mipmap 每一层记录的是上一层某个范围内的均值

通过记录多个层次的mipmap，那么便可以在使用中直接读取某一层的均值

但mipmap存在一个缺陷，即它只能记录方形的范围，因而存在另一种方法，即 **Summed Area Tables (SAT)**

##### Variance

方差可通过公式直接计算，即，存储 depth 和 depth² 的 mipmap，便可快速获得方差
$$
Var(X) = E(X^2) - E^2(X)
$$

##### Back to the question

综上，我们获得了均值和方差，下一步就是要求得当depth为某个值时，此时所占的百分比，即它的累积分布函数（CDF）

![image-20221107105134397](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107105134397.png)

但实际上，我们并不需要一个太过准确的结果，我们需要的仅是一个大致百分比，**切比雪夫不等式**便可满足这个使用需求
$$
P(x > t) \leq \frac{σ^2}{σ^2 + (t - u)^2}
$$
![image-20221107105714350](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107105714350.png)

##### Performance

从上述步骤发现，获得深度的均值仅需O(1)，获得深度平方的均值仅需O(1)，切比雪夫计算O(1)，**完全不需要采样或循环**

#### Back to Step 1：blocker search

blocker search 也需要对区域内采样比较深度 z < t

![image-20221107110109998](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107110109998.png)

##### Key idea

Blocker (z < t), avg. Z_occ

Non-blocker (z > t), avg. Z_unocc
$$
\frac{N_1}{N}Z_{unocc} + \frac{N_2}{N}Z_{occ} = Z_{Avg}
$$
近似的看，N1 / N = P(x > t)，可以用切比雪夫获得，N2 / N = 1 - P(x > t)

而对于Z_unocc，我们无法知道，**但可以大胆的令Z_unocc = t，即所有比shading point更远的深度，都默认为该值就等于着色点的深度**

那么，已知Z_avg是整个区域的平均深度，结合上述几个值，最后便能直接求得blocker的平均深度Z_occ



#### MIPMAP for Range Query

![image-20221107111800188](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107111800188.png)



#### SAT(Summed Area Tables) for Range Query

**SAT 的算法思想是前缀和**

在一维中，就是额外使用一个数组依次记录前缀和，则个位置相减，即为这两个位置中间部分的和

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107111905802.png" alt="image-20221107111905802" style="zoom: 67%;" />

SAT 是前缀和在二维上的使用，即先横向做前缀和，再纵向做前缀和，并记录该计算结果，随后仅需如图方块的加减即可（例如每个方块以右下角的点作为计算点）

![image-20221107112008982](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107112008982.png)

时间复杂度是O(n)

### VSSM‘ Cons

对于符合正太分布的情况，VSSM有着很好的结果，但对于存在多个变化的分布，则会出现错误

![image-20221107120710265](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107120710265.png)

因为VSSM是用单个变化的曲线去模拟，因而对于复杂的情况会存在错误，例如阴影过白

​													<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107120820618.png" alt="image-20221107120820618" style="zoom:75%;" />![image-20221107120906283](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107120906283.png)



### Moment Shadow Mapping

MSM 是针对VSSM问题的解决办法

它使用高阶矩 (higher order moments) 来代表分布，而 VSSM 中仅使用了一二阶矩

矩的前m阶可以表示一个具有 m / 2 个步骤的函数，通常4 可以很好的近似实际深度的CDF

![image-20221107122516952](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107122516952.png)

MSM 和 VSSM 极其近似，它在生成 shadow map 时，记录z，z^2，z^3，z^4，并在blocker search 和 PCF 期间

恢复CDF

Pro：优秀的结果

Cons：存储开销大，执行的性能开销大（在重构过程中）

![image-20221107123428521](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107123428521.png)



### Distance Field Soft Shadows

SDF(signed distance field) 是由距离函数获得的

![image-20221107163124404](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221107163124404.png)

##### 距离函数是：对于任意点都计算它到物体最近点的最短距离（可以带正负），对于多个物体，则该点仅存储最小的距离

![image-20221107163408526](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107163408526.png)

##### An Example: Blending (linear interp.) a moving boundary

![image-20221107163449520](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107163449520.png)

#### The Usages of Distance Fields

##### Usage 1：Ray marching to perform ray-SDF intersection

每个点的 SDF 表示了它能遇到物体的最短距离，因而在该距离内，向任何方向行走都是安全的，即不可能遇到物体

那么假设存在一条光线，在光源出发，依次读取各个点的SDF，并在光线方向上走该SDF的距离，直到SDF小于某个范围，代表遇到了物体，或者多次行进后仍未遇到物体，代表该光线无效

![image-20221107163729000](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107163729000.png)

##### Usage 2：Use SDF to determine the (approx.) percentage of occlusion

对 Ray marching 路径上每个点求它的SDF，并记录从相机出发观察，不被遮挡的最小 “safe angle” ，该角度和观察角度的比值可估计遮挡的百分比，即 visibility term

​																	<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107164748963.png" alt="image-20221107164748963" style="zoom:90%;" />![image-20221107165029246](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107165029246.png)

##### How to compute the angle?

![image-20221107165214496](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107165214496.png)
$$
k\cdot\frac{ SDF(p)}{|p-o|}
$$
由于角度范围在[0, pi/2]，因而可以得到上式的范围在[0, 1]

引入一个变量k进行控制，当k较大时，例如10，则该式的其他部分应在[0, 0.1]才有效，当k较小时，例如1，则该式的其他部分在[0, 1]都有效

易发现，k影响着式子的过度范围，当k极大时，该式的值可以视为要么0要么1，即要么不遮挡，要么完全遮挡，等价于硬阴影的效果

**即k影响阴影的柔和程度**

![image-20221107171314379](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107171314379.png)![image-20221107171325843](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107171325843.png)![image-20221107171336839](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107171336839.png)

​								**k = 2																		k = 8																			k = 32**

##### Distance Field: Visualization

![image-20221107175805088](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107175805088.png)

##### Pros and Cons of Distance Field

Pros：迅速、高质量

Cons：需要预计算、以及大量的存储空间

##### Another Interesting Application

反走样 / 无限分辨率字符

![image-20221107180033024](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107180033024.png)



## Shading from Environment Lighting

非正式命名也可称为，Image-Based Lighting(IBL)

由于光源来自四面八方的无限远处，因而不计算可见性

![image-20221107180251654](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107180251654.png)

通常的方法——蒙特卡洛积分，问题是需要大量采样

#### Observation

可以发现，如果BRDF 是 glossy，那么具有较小的support，如果是diffuse，则比较smooth，因此满足了之前提过的近似方程

![image-20221107180448479](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107180448479.png)
$$
\int_{Ω}f(x)g(x)dx \approx  \frac{\int_{Ω}f(x)dx}{\int_{Ω}dx} \cdot\int_{Ω}g(x)dx
$$

#### The Split Sum: 1st Stage

$$
L_o(p, w_o) \approx \frac{\int_{Ω_{fr}}L_i(p, w_i)dw_i}{\int_{Ω_{fr}}dw_i} \cdot \int_{Ω_+}f_r(p, w_i, w_o)cosθ_idw_i
$$

第一步操作是针对Light，其公式含义代表对 light 进行 filtering，即 **prefiltering 环境光**

![image-20221107193034139](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107193034139.png)

随后便能发现，**在反射光瓣范围内采样多个点求均值，和对预过滤的环境光在反射方向进行采样，结果是一致的**

![image-20221107193107247](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107193107247.png)

#### The Split Sum: 2nd Stage

第二步是要处理BRDF的积分项如何避免采样，已知BRDF的公式如下
$$
f(i, o) = \frac{F(i, h)G(i, o, h)D(h)}{4(n, i)(n, o)}
$$
**Fresnel term**：the Schilck’s approximation，即**菲涅尔项仅记录基础反射率R_0和角度θ即可**
$$
R(θ) = R_0 + (1 - R_0)(1-cosθ)^5
$$

$$
R_0 = (\frac{n1 - n2}{n1 + n2})^2
$$

**NDF term**：e.g. Beckmann distribution，**即NDF仅记录粗糙度α和角度θ即可**
$$
D(h) = \frac{e^{-\frac{tan^2θ_h}{α^2}}}{πα^2cos^4θ_h}
$$
从原式发现，计算BRDF仅需对**基础反射率R_0、角度θ、粗糙度α**三个值积分所有结果就能获得一个三维的预计算

但为了进一步化简，降低到二维，**处理方法是，拆开菲涅尔项**，其中 fr / F 代表去除菲涅尔项的剩余BRDF
$$
R(θ) = R_0(1 - (1-cosθ)^5) + (1-cosθ)^5
$$

$$
\int_{Ω_+}f_r(p, w_i, w_o)cosθ_idw_i \approx 
R_0\int_{Ω_+}\frac{f_r}{F}(1 - (1-cosθ_i)^5)cosθ_idw_i
+\int_{Ω_+}\frac{f_r}{F}(1-cosθ_i)^5cosθ_idw_i
$$

**拆分后基础反射率R0被分到积分外部，且对于同一种BRDF，R0可视为常数，从而原积分不在依赖于R0，仅记录根据角度θ、粗糙度α的预计算结果即可**，最后可记录为一张二维表

![image-20221107194302073](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107194302073.png)

#### The Split Sum Approximation

在工业界喜欢将积分公式写为蒙特卡洛积分的求和形式，这也是这个方法被称为 **split sum** 的原因
$$
\frac{1}{N} \sum_{k=1}^N \frac{L_i(l_k)f(l_k, v)cosθ_{lk}}{p(l_k, v)}
\approx
(\frac{1}{N}\sum_{k=1}^N L_i(l_k))
(\frac{1}{N}\sum_{k=1}^N \frac{f(l_k, v)cosθ_{lk}}{p(l_k, v)})
$$
![image-20221107195536154](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221107195536154.png)



## Shadow from Environment Lighting

通常，在实时渲染中难以实现
由于环境光存在**多光源问题**，因此生成SM的损耗和光源数线性相关

在采样上，visibility term 极其复杂，且 V 不能从环境中简单分离

#### Industrial solution

在工业上，通常选择最亮的几个光源来生成阴影，作为结果

#### Related research

Imperfect shadow maps

Light cuts

RTRT（可能是最终的解决办法）

Precomputed radiance transfer(PRT)

##### 总之：目前还没有完全的解决办法



## Real-time Environment Lighting

### Background knowledge

#### A general understanding

在games101中提到，空域的卷积等价于频域的乘积

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108135730149.png" alt="image-20221108135730149" style="zoom:80%;" />

**任何乘积的积分都可以视为filtering，这个积分的频率是两个函数中最低的频率**
$$
\int_{Ω}f(x)g(x)dx
$$

##### 其中：Low frequency == smooth function / slow changes



#### Basis Functions

通常一组基函数可以用于表示其他的函数，例如傅里叶级数
$$
f(x) = \sum_i c_i \cdot B_i(x)
$$
多项式级数也能由基函数组成

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108141934330.png" alt="image-20221108141934330" style="zoom:80%;" />



### [Spherical Harmonics（SH）球谐函数](https://zhuanlan.zhihu.com/p/351289217)

**SH 是一组定义在球面的 2D 基函数 Bi(w)**，其中蓝色表示正数，黄色表示负数，并具有如下两个性质：

​	**★正交完备性**

​	无论 Y 具体是什么或怎么计算，只需知道两个球谐函数一模一样时才为 1 否则就为 0，**这是球谐函数用来简化计算的核心**
$$
\int_Ω Y_l^m(w) Y_k^n(w)dw =
\left\{
\begin{array}{lr}
1, &m == n\&\&l == k\\
0, &m != n||  l != k
\end{array}
\right.
$$
​	**★旋转不变性**

​	环境光照变化之后，只需要**简单的计算**就可以得到光源旋转之后的结果，**这个性质使得球谐函数适用性更强**



**Projection：任何基函数前的系数，都是目标函数在该基函数上的投影**

那么，只要记录这些系数，就能结合基函数重构原有的函数（不能完全还原，但使用的基函数越多越靠近）
$$
c_i = \int_Ω f(w)B_i(w)dw
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108141856121.png" style="zoom:80%;" />

### prefiltering

**Prefiltering + single query = no filtering + multiple queries**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108145950053.png" alt="image-20221108145950053" style="zoom:80%;" />

### Analytic Irradiance Formula

我们知道漫反射的 BRDF 就像一个低频的 filter，而在Rubi 的实验中可以发现，仅需前三阶就能表示diffuse BRDF
$$
E_{lm} = A_lL_{lm}
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108201323130.png" alt="image-20221108201323130" style="zoom:80%;" />

那么，结合之前的结论：**两个函数相乘并积分的频率为两个函数的最低频率**，我们可以得到，着色公式中，无论光照有多么高频，其结果都受漫反射的BRDF影响，为低频

换言之，我们其实可以直接用低频去表示光照，因为其高频部分最终会被过滤掉

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108201812589.png" alt="image-20221108201812589" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108201825717.png" alt="image-20221108201825717" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108201901076.png" alt="image-20221108201901076" style="zoom:67%;" />

在之后的实验发现，的确仅需用前三阶的球谐函数来表示环境光，就能获得较低误差的结果

### In Real-Time Rendering (FYI)

历史性的时刻，Rubi最后用两行代码计算环境光下某个着色点的计算结果，开创了用球谐函数解决问题的时代
$$
E(n) = n^TMn
$$

```cpp
surface float1 irradmat (matrix4 M, float3 v) {
    float4 n = {v , 1} ;
    return dot(n , M*n) ;
}
```

### Precomputed Radiance Transfer (PRT)

$$
L(o) = \int_ΩL(i)V(i)ρ(i, o)max(0, n\cdot i)di
$$

​																		![image-20221108210850260](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108210850260.png)![image-20221108210859459](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108210859459.png)![image-20221108210907753](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221108210907753.png)

对于渲染方程可以分别对Li、Vi、ρ仅需预计算成三张球面光，每次读取三张图进行计算即可，但这意味着对于每个着色点我都需要计算大量的像素来生成这三张图

##### PRT就是对这个步骤的预计算进行简化

![image-20221108211123213](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108211123213.png)

其方法为：**将公式分为 lighting和 light transport 两部分**

其中 light transport 可视为 shading point 的固有属性，因而认为这部分是不变的，可以进行预计算

即整个公式中，仅 lighting 是可以变化的

对光源进行基函数近似，即
$$
L(i) \approx \sum l_iB_i(i)
$$
优点：引入了 Visibility term，即阴影的计算；预计算加速

缺点：空间中其他物体不能移动

#### Diffuse case

对于漫反射情况，BRDF是个常数，则带回上述公式回原方程可得
$$
L(o) \approx ρ \int \sum l_iB_i(i)V(i)max(0, n\cdot i)di
$$
在图形学中，一般求和和积分的顺序可以随意变化 
$$
L(o) \approx ρ \sum l_i \int B_i(i)V(i)max(0, n\cdot i)di
$$
注意其中的积分项，可以视为 visibility 的球面函数在基函数上的投影，**即系数，可以进行预计算**
$$
T_i = \int B_i(i)V(i)max(0, n\cdot i)di
$$
而 li 项也可通过如下公式进行计算，最后的 li 作为系数，相较于之前的一张cube map，此时仅需一个 vector 进行存储，后续也可以通过公式进行重构L(i)
$$
l_i = \int L(i) \cdot B_i(i) di
$$
最后对于着色点的计算化简为一个点乘

**要做的步骤就是投影光照到基函数上获得一个 li 的向量，再和着色点预计算 light transport 而获得的 Ti 向量进行一个点乘**
$$
L(o) \approx ρ \sum l_iT_i
$$
更夸张的说，light transport 不仅可以考虑当前bounce，甚至可以考虑多次 bounce 的结果

![image-20221108212339249](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108212339249.png)



其中，针对Ti的预计算也可换种理解方式，可以将B(i)这个基函数视为此时的光照L(i)，那么每次系数的计算就好像在求一个特殊的B(i)光照下，所得到的着色点的颜色
$$
T_i = \int B_i(i)V(i)max(0, n\cdot i)di
$$
![image-20221108213347057](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221108213347057.png)



#### PRT(diffuse case)的另一种推导过程

$$
L_o(p, w_o) = \int_{Ω+}L_i(p, w_i)f_r(p, w_i, w_o)cos\theta_iV(p, w_i)dw_i
$$

$$
L(w_i) \approx \sum_p c_pB_p(w_i) \\
T(w_i) \approx \sum_q c_qB_q(w_i)
$$

对于light项和 light transport 项都可拆分成基函数求和，那么
$$
L_o(p, w_o) = \sum_p \sum_q c_p c_q \int_{Ω+}B_p(w_i)B_q(w_i)dw_i
$$
注意，球谐函数之间是正交的，相互的投影为0，只有对自己投影时，结果才为1，即，只有p == q 时，积分值为1，否则为0，化简得
$$
L_o(p, w_o) = \sum l_i T_i
$$

#### Glossy Case

$$
L(o) = \int_ΩL(i)V(i)ρ(i, o)max(0, n\cdot i)di
$$

在diffuse材质中，由于ρ的出射方向 w_o 是整个半球面，因为不用考虑，但在glossy材质中，出射方向 w_o 是特定的，因而不能将 ρ 简单的当作常数提出

考虑的方法是：**w_o 可能为任意方向，那么我们就在diffuse计算的基础上，预计算所有的 w_o 即可**
$$
L(o) \approx \sum l_iT_i(o) \\
T_i(o) \approx \sum t_{ij}B_j(o) \\
L(o) \approx \sum(\sum l_it_{ij})B_j(o)
$$
其中，l_i 是光照在基函数上的系数（vector），t_ij 是 light transport 在基函数上的系数（Matirx），最后的结果是一个 vector，即所有 w_o 方向的值的结果

![image-20221115153624647](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115153624647.png)

![image-20221115153944729](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115153944729.png)

#### Interreflections and Caustics

$$
LE\\
L(D|G)^*E
$$

$$
LGE\\
LS^*(D|G)^*E
$$

L：light，G：glossy object，E：eye

表示光线从L->G->E，其中的过程可能是经过多次的diffuse / glossy，但都可以简化堪称 transport

运行时间与transport的复杂度无关

![image-20221115201147667](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221115201147667.png)

当光线经过 specular 反射到diffuse物体上，形成的视觉效果叫 caustics

<img src="C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221115201602841.png" alt="image-20221115201602841" style="zoom:67%;" />

#### Time Complexity

在前n阶的球谐函数中，diffuse rendering 对每个着色点进行一次点乘（O(n^2)），glossy rendering 则需要进行一个 vector * matrix（O(n^2 * (n^2 * n^2))）

#### Summary

1. 使用基函数（SH）近似 lighting 和 light transport

​		lighting -> lighting coefficents

​		light transport -> coefficients / matrices

2. 预计算并存储 light transport

3. 渲染：

​		Diffuse : dot product

​		Glossy  ：vector matrix multiplication

#### Limitations

SH 仅适用于低频函数，难以模拟高频

动态 lighting， 但场景和材质是静态的（不可改动）

预计算数据量较大

![image-20221115155851267](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115155851267.png)

### More basis functions——Wavelet（小波）

wavelet 适用于表示所有频率的，是一种非线性的近似

由于wavelet存储在块中，因而主要是处理 cube map，对各个面进行wavelet 变换，最后仅保留少量非零系数

wavelet可以使用所有基函数，而不用分前几阶

wavelet 不适合旋转的场景

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115160021998.png" alt="image-20221115160021998" style="zoom:80%;" />

​					<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115202544780.png" style="zoom:50%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115202515982.png" alt="image-20221115202515982" style="zoom:50%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115202632480.png" style="zoom:50.4%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115202744829.png" alt="image-20221115202744829" style="zoom:50.3%;" />

### low frequency VS all frequency

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115160558388.png" alt="image-20221115160558388" style="zoom:80%;" />



## Real-Time Global Illumination(in 3D)

Global Illumination (GI) is important but **complex**

![image-20221115203300663](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115203300663.png)

在RTR中，人们寻找一种能快速且简单的解决办法，针对： **one bounce indirect illumination**

### Reflective Shadow Maps (RSM)

RSM 是利用 shadow map 产生的一种间接光计算方法，它把每一个被光源直接照射到的表面称为次级光源，这些次级光源发射的光线产生的照明即为 one bounce 的间接照明

**RSM 假设 shadow map 上的每个像素都是被光源照亮的次级光源，每个像素不仅存储了深度信息，还存储了次级光源点的世界坐标、法线、以及照度flux**

![image-20221115204426715](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115204426715.png)

RSM 还假设每个次级光源点，即 **reflector 是 diffuse 的**，这样相机所看到的radiance就等于着色点获得的radiance（因为漫反射是均匀射出）

RSM 还假设**间接照明中不考虑 visibility 项**（因为难以计算）
$$
L_o(p, w_o) = \int_{Ω_{patch}}Li(p, w_i)V(p, w_i)f_r(p, w_i, w_o)cos\theta_idw_i \\
= \int_{A_{patch}}Li(q→p)V(p, w_i)f_r(p, q→p, w_o)\frac{cos\theta_i cos\theta_q}{||q-p||^2}dA
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115205101146.png" alt="image-20221115205101146" style="zoom:67%;" />

对于一个diffuse 的反射面：
$$
f_r(q) = ρ / \pi \\
$$
其中BRDF的定义是出射的 radiance 比上入射的 radiance ，因此可得如下
$$
L_i = f_r(q) \cdot \frac{\Phi}{dA}
$$
上述推导的好处是可消去面积 dA
$$
L_o(p, w_o) = \Phi_p f_r(q)f_r(p, q→p, w_o) \frac{cos\theta_i cos\theta_q}{||q-p||^2}
$$

$$
E_p(x, n) = \Phi_p \frac{max(0, (n_p \cdot (x - x_p)))max(0, (n_p \cdot (x - x_p))}{||x - x_p||^4}
$$

其中分母除以四次是因为点乘求 cosθ 需要normalization，因此两个点乘个需要除以一个模

上述公式即为计算次级光源射出的光线能量

#### Acceleration

次级光源对被照射点p的光照贡献还需要考虑法线方向，例如X_q对x就没有贡献

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115211449705.png" alt="image-20221115211449705" style="zoom:67%;" />

由于shadow map 中存在大量像素，对一个被照射点进行每个次级光源的计算是不现实的

RSM 认为，对被照射点 P 真正有贡献的是 P 点周围的次级光源，而在世界坐标相近的点，在shadow map上也一定相近

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115211733247.png" alt="image-20221115211733247" style="zoom:67%;" />

**为了进一步考虑重要性采样，RSM令采样密度随着与关注点(s, t) 的距离增大而减小，而权重随着距离增大而增大**

![image-20221115211809727](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221115211809727.png)

#### Pros

容易执行

#### Cons

具有着shadow map的所有问题（光源数目增加，生成map的开销线性增加）

对于间接光照不考虑visibility

许多假设：diffuse reflectors， depth as distance（世界坐标中的距离实际上比记录在shadow map上的深度更大）

采样率和质量直接的 tradeoff



### Light Propagation Volumes (LPV)

##### Key idea

光线沿着直线行进，且不会发生改变

##### Key solution

使用3D轴网将次级光源发出的radiance传播到任何位置

##### Key problem

需要搜索每个着色点获得的来自各个方向的radiance

![image-20221116124158841](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116124158841.png)

#### Steps

1. 生成 radiance 点集场的表示方式

   可以通过RSM寻得一组简化的diffuse surface patches（virtual light source）

   ![image-20221116115213178](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116115213178.png)

2. 把 virtual light source 的点云注入 radiance volume

   将场景预计算成一个3D轴网，对每个格子寻找最近的VLS，计算他们的 radiance 分布，投影到前二阶的SH上

   ![image-20221116115449810](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116115449810.png)

3. 执行 radiance 的传播

   对每个格子，搜集来自它六个面的radiance，并求和，再使用SH进行表达，重复这样的步骤多次直到稳定

   ![image-20221116115601205](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116115601205.png)

4. 根据最后一次的光线传播volume进行场景的照明

   对每个着色点寻找它对应的格子，抓住这个格子的入射radiance，然后shade

##### problems：同个格子中存在误差，即实际被遮挡，但仍使用了该格子记录的radiance，造成 light leaking

![image-20221116115734119](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116115734119.png)

![image-20221116124625055](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116124625055.png)

​															LPV																																reference

### Voxel Global Illumination(VXGI)

VSGI 也是一个 **2-pass 算法**

#### 相较于RSM：

VSGI 将整个3D场景划分为格子，格子之间存在层次结构

从相机出发打条ray到shading point，随后对该点的reflected cones进行 tracing，看锥体能接触到哪些 voxel

​																<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116171313226.png" alt="image-20221116171313226" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116171847507.png" alt="image-20221116171847507" style="zoom:78%;" />

#### Pass 1 from the light

VSGI认为 reflector 是 glossy 的，因此在每个 voxel 记录入射分布和法线分布，并更新层级（即更大范围格子的分布信息）

![image-20221116172039859](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116172039859.png)

#### Pass 2 from the camera

对于 glossy 表面，向反射方向 trace 一个锥体，并根据椎体大小搜寻对应层级

​									![image-20221116172244222](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116172244222.png)![image-20221116172254061](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116172254061.png)

#### For diffuse

由于初始认定反射面是glossy的，对于diffuse的半球范围，VSGI使用多个圆锥进行模拟

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116173025958.png" alt="image-20221116173025958" style="zoom:80%;" />

### 小结

LPV是寻找到所有次级光源，进行一次光线传播，记录空间中所有格子的irradiance 信息，并用SH存储，速度较快，但不够准确

VXGI 是对所有的着色点去寻找对它存在贡献的次级光源，随后进行求和获得，效果好，但速度慢

## GI in Screen Space

所谓 screen space 是指仅使用屏幕中的信息，即对已有的渲染结果进行后期处理 

### Screen Space Ambient Occlusion(SSAO)

AO 的好处：容易执行，能增强相对位置感

![image-20221116181005533](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116181005533.png)

#### Key idea 1

假设入射的间接光是个**常量**（环境光）

#### Key idea 2&3

不同方向对环境光的**可见性不同**，即入射的环境光不一定能被接收到

假设材质是 **diffuse** 的

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116181245844.png" alt="image-20221116181245844" style="zoom: 80%;" />

#### Ambient Occlusion

![image-20221116181348227](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116181348227.png)

#### Theory

$$
L_o(p, w_o) = \int_{Ω_+}L_i(p, w_i)f_r(p, w_i, w_o)cosθ_iV(p, w_i)cos\theta_idw_i
$$

$$
L_o^{indir}(p, w_o) \approx \frac{\int_{Ω_+}V(p, w_i)cos\theta_idw_i}{\int_{Ω_+}cos\theta_idw_i}
\cdot \int_{Ω_+}L_i^{indir}(p, w_i)f_r(p, w_i, w_o)cosθ_idw_i
$$

通过近似拆分，左边的结果为加权平均得到各个方向的平均 visibility，右边由于环境光Li和diffuse的brdf都是常量，因此结果是个常数
$$
\frac{\int_{Ω_+}V(p, w_i)cos\theta_idw_i}{\int_{Ω_+}cos\theta_idw_i} = k_A =
\frac{\int_{Ω+}V(p, w_i)cos\theta_idw_i}{\pi}
$$

$$
\int_{Ω_+}L_i^{indir}(p, w_i)f_r(p, w_i, w_o)cosθ_idw_i = 
L_i^{indir}(p) \cdot \frac{ρ}{\pi}\cdot \pi = 
L_i^{indir}(p) \cdot ρ
$$

**综上，决定Lo结果的实际上是visibility term，这刚好与之前图片得出的结论一致**

注意，上述近似拆分的过程中，我们拆出了：
$$
\frac{\int_{Ω_+}f(x)cos\theta_idw_i}{\int_{Ω_+}cos\theta_idw_i}
$$
但原公式是：
$$
\int_{Ω}f(x)g(x)dx \approx  \frac{\int_{Ω}f(x)dx}{\int_{Ω}dx} \cdot\int_{Ω}g(x)dx
$$
上下均多了一个 cosθ，这是考虑到 **projected solid angle** 中 `dx⊥ = cosθ·dw`，即立体角乘以一个cosθ，就投影到了单位圆上，因此上述的拆分后的 `ka` 项本质上是对单位圆的范围内进行积分

![image-20221116182917620](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116182917620.png)

最后用一个直观的理解，由于brdf 和 环境光 Li 都是常量，公式可推导为，上述的推导过程只是为了表明公式中 pi 的来源

![image-20221116185010348](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116185010348.png)



#### How to compute the ka in real time

##### 在世界空间（3D）：

可通过射出光线进行计算，但速度慢，且依赖场景复杂度

##### 在屏幕空间：

通过后期渲染处理，不需要预处理，不依赖场景的复杂程度，比较简单，但在物理层面不够精确

#### SSAO：使用 z -buffer 进行环境光遮蔽

主要方法通过depth buffer来近似场景几何，通过在每个像素为圆心的圆内进行采样，并通过深度进行比较

**如果超过半数的采样点在物体内部，那么就使用AO，AO的值取决于法线方向的球内两种样本的比例**

![image-20221116185524631](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116185524631.png)

在遇到一些深度贴图无法预知的几何形状可能会出现一些近似上的错误，结果并不准确，但看起来合理

![image-20221116185946450](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116185946450.png)



#### Horizon based ambient occlusion（HBAO）

也是在屏幕空间，需要已知法线，在法线方向的半球内进行采样

以前的技术认为在深度贴图上法线信息是不可知的，需要整个球体内采样，因而计算中遮蔽样本比重较大，会偏暗；但现有渲染中默认法线信息容易得到

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221116190300479.png" alt="image-20221116190300479" style="zoom:80%;" />



### Screen Space Directional Occlusion（SSDO）

SSDO是SSAO的拓展，SSAO认为每个点获得的间接光照都一致，只是在接收程度上有差异，SSDO认为可以更精准的看待光照，未必获得的就是一致的

![image-20221124104713743](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124104713743.png)

![image-20221124104752773](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124104752773.png)

SSDO 和 路径追踪近似，它在每个着色点 P 射出一条任意光线，如果没hit 障碍物，则说明是间接光照，否则就是间接光照

![image-20221124105019665](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124105019665.png)

#### Comparison SSAO / SSDO

**AO : indirect illumination (RED) + no indirect illumination (YELLOW)**

**DO : no indirect illumination  (RED) + indirect illumination (YELLOW)**

SSAO 考虑的是更大的范围，它认为光线如果没被近距离的遮挡，说明它可以接收到远处的间接光照明，否则就是没有间接光

SSDO 考虑的是较小范围，它认为光线如果被近距离的遮挡，说明在此处发生了bounce即间接照明

**两者的结果截然相反，是因为考虑的边界范围不同**

理想状况下结合两者才能刚好覆盖到全范围，但工业上尚未有具体方法

![image-20221124105342689](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124105342689.png)

#### Consider unoccluded and occluded directions separately

$$
L_o^{dir}(p, w_o) = \int_{\Omega+,V=1}L_i^{dir}(p, w_i)f_r(p, w_i, w_o)cos\theta_idw_i
$$

$$
L_o^{indir}(p, w_o) = \int_{\Omega+,V=0}L_i^{indir}(p, w_i)f_r(p, w_i, w_o)cos\theta_idw_i
$$

综上，可借助之前计算间接光照的技术（LPV、VXGI等）计算间接光部分

#### Similar to HBAO, test samples’ depths in local hemispheres

SSDO在采样上和HBAO类似，都是对法线方向的正半球进行采样，它通过shadow map 观察采样点是否可见

**此处假设对于相机可见的采样点，着色点 P 也能看见**

若这些采样点不可见，说明发生了bounce，则计算这些点对着色点 P 的间接照明

上述假设有个缺陷，如下图三的特殊情况，这也是后续技术SSR所克服的地方

![image-20221124110237321](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124110237321.png)

#### SSDO: quality closer to offline rendering

SSDO 的质量接近离线渲染，但也存在缺陷

**由于仍然是基于屏幕空间的方法，它所能获得的信息仅限于屏幕空间，即图后的信息是不可见的**

下图可见，随着旋转，当看不到黄色面时，本该出现在地面的黄光反射消失了

![image-20221124110709665](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124110709665.png)

此外，由于SSDO考虑的是一个较小范围，忽视了较远距离的间接光

下图是使用 photon mapping 的方法，若使用 SSDO，box上不会出现右墙的反光

![image-20221124110910642](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124110910642.png)



### Screen Space Reflection (SSR)

老师说他更愿意称该技术为 **Screen Space Ray-Tracing (SSR)**

SSR 是 RTR 中的全局光照技术，**主要是能够在屏幕空间做光线追踪**，而不需要直到三维的物体信息

#### Two fundamental tasks of SSR

Intersection：将光线和屏幕空间生成的图像（壳）进行求交

Shading：计算交点对着色点的贡献

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124112329940.png" alt="image-20221124112329940" style="zoom: 67%;" />



#### Basic SSR Alogorithm - Mirror Reflection

对于一个场景中的反射，本质上可以看作是对原有物体信息进行一个镜像处理，即反射的内容是屏幕中已有的东西

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124112358556.png" alt="image-20221124112358556" style="zoom:67%;" />

```cpp
For each fragment
	compute reflection ray
	Trace along ray direction(using depth buffer)
	use color of intersection point as reflection color
```

利用SSDO和不同的计算方式可以生成如下效果

​					<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124134302810.png" alt="image-20221124134302810" style="zoom: 50%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124134312127.png" alt="image-20221124134312127" style="zoom: 50%;" />

​					<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124134321771.png" alt="image-20221124134321771" style="zoom: 50%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124134603100.png" alt="image-20221124134603100" style="zoom:50%;" />

![image-20221124134846303](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124134846303.png)



#### Linear Raymarch

SSR 的主要步骤是从相机出发，计算某个着色点的颜色，在反射方向上，每次行进一个固定步长，直到找到和壳相交的大致位置

![image-20221124135423946](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124135423946.png)

但考虑到这个固定步长的大小难以确定，小了增大计算量，大了会影响交点位置的确定

于是引入一个方式，进行分级的光线追踪（hierarchical ray trace）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124135653474.png" alt="image-20221124135653474" style="zoom: 50%;" />

并**生成深度的mipmap**，注意，此处不是求范围内的平均，而是记录每个范围内的最小值，类似最小池化层

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124135823275.png" alt="image-20221124135823275" style="zoom: 50%;" />

记录最小值的原因是：人们观察到，当光线在和一个范围内的最小值都不能相交时，那它和这个范围内的任何区间都不会相交

![image-20221124140012335](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140012335.png)

于是想到了一种行进方式：**当没有相交时，则选择更上一层mipmap，且行进的步长调整为对应mipmap的范围长度；若相交了，则判断相交在哪个部分，并降低mipmap层次，减小行进步长，直到找到和物体表面的交点**

```cpp
mip = 0;
while(level > -1){
    step through current cell;
    if (above z plane) ++level;
    if (below z plane) --level;
}
```

​			<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140530881.png" alt="image-20221124140530881" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140602096.png" alt="image-20221124140602096" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140618189.png" alt="image-20221124140618189" style="zoom:67%;" />

​			<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140633046.png" alt="image-20221124140633046" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140721417.png" alt="image-20221124140721417" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124140741197.png" alt="image-20221124140741197" style="zoom:66%;" />

#### Cons

由于屏幕空间只能看到生成的壳，而不能看到壳后的信息，例如图中反射的图像看不到手掌心等内容

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124142028963.png" alt="image-20221124142028038" style="zoom: 50%;" />

当反射图像应获取的点超出了图片范围就会生成边界，通常可通过渐变衰减来克服这种情况

​									<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124142147008.png" alt="image-20221124142147008" style="zoom: 33%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124142202809.png" alt="image-20221124142202809" style="zoom: 33%;" />

#### Shading using SSR

在 SSR 中的着色计算和path-tracing的没有差异，只是**需要假设 reflector 是diffuse的**，因为当次级光源是漫反射的，才能保证屏幕空间，即相机记录的radiance 和屏幕中的壳照射到着色点的 radiance 是相同的
$$
L_o(p, w_o) = \int_{\Omega+}L_i(p, w_i)f_r(p, w_i, w_o)cos\theta_idw_i
$$
由于 SSR 是对 BRDF 做 sampling，因此不存在距离衰减的问题，且能计算着色点是否能能看到次级光源；但对 light 进行 sampling 的问题中，必然会伴随距离衰减和难以计算着色点是否能能看到次级光源的情况

因为对次级光源采样是对area进行积分，irradiance 随着距离增大会衰减，但对 BRDF 采样是对立体角积分，radiance 不会随着距离变化

所谓对BRDF采样即，当BRDF是specular 时，反射方向固定，此时就不存在积分可直接求值，当BRDF时glossy时，反射方向是个lobe，该lobe由一个立体角进行表示，因此此时的路径追踪就是计算这个立体角范围内所接触到的表面对该着色点的贡献

#### Therefore

基于上述推导，SSR具有以下四个特性：

##### Sharp and blurry reflections

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124145719492.png" alt="image-20221124145719492" style="zoom: 67%;" />

##### Contact hardening

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124145743067.png" alt="image-20221124145743067" style="zoom: 67%;" />

##### Specular elongation

认为地面的brdf是各向同性的，即法线在一个圆上均匀分布；在一个特殊视角下观察这种brdf反射出的lobe，会是一个长条的椭圆，也就出现了拉伸的反射效果

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124145808660.png" alt="image-20221124145808660" style="zoom:67%;" />

##### Per-pixel roughness and normal

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124145826120.png" alt="image-20221124145826120" style="zoom:67%;" />



## Real-Time Physically-Based Materials

PBR 通常指基于物理的渲染，但在 RTR 中，PBR 通常指代基于物理的材质

事实上在 RTR 中，许多情况为了优化速度和结果，其渲染过程未必仍然是完全基于物理的了

### PBR Materials in RTR

对于 RTR 中的PBR材质：

For surfaces：通常指 microfacet models（微表面模型）和 Disney principled BRDFs 

For volumes：通常聚焦于快速的近似的单次散射和多重散射

![image-20221124151757484](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124151757484.png)

### Recap: Microfacet BRDF

$$
f(i, o) = \frac{F(i, h)G(i, o, h)D(h)}{4(n, i)(n, o)}
$$

![image-20221124151846305](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124151846305.png)

BRDF 主要由 Fresnel 项、几何项、法线分布项影响

#### Fresnel

Fresnel 项决定了材质的反射和角度的关系，对于绝缘体，反射随着角度增大而增大；导体同样，但在角度较小时仍有着较大反射

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124152201221.png" alt="image-20221124152201221" style="zoom: 67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124152213347.png" alt="image-20221124152213347" style="zoom:67%;" />
$$
Rs = |\frac{n_1cos\theta_i - n_2cos\theta_t}{n_1cos\theta_i + n_2cos\theta_t}|^2
=|\frac{n_1cos\theta_i - n_2\sqrt{1-(\frac{n1}{n2}sin\theta_i)^2}}{n_1cos\theta_i + n_2\sqrt{1-(\frac{n1}{n2}sin\theta_i)^2}}|^2	\\
R_p = |\frac{n_1cos\theta_t - n_2cos\theta_i}{n_1cos\theta_t + n_2cos\theta_i}|^2
=|\frac{n_1\sqrt{1-(\frac{n1}{n2}sin\theta_i)^2} - n_2cos\theta_i}{n_1\sqrt{1-(\frac{n1}{n2}sin\theta_i)^2} + n_2cos\theta_i}|^2		\\
R_{eff} = \frac{1}{2}(R_s + R_p)
$$

##### Approximate: Schlick’s approximation

$$
R(\theta) = R_0 + (1 - R_0)(1 - cos\theta)^5 \\
R_0 = (\frac{n1 - n2}{n1 + n2})^2
$$

#### Normal Distribution Function (NDF)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124153002334.png" alt="image-20221124153002334" style="zoom: 80%;" />

注意法线分布和正态分布无关，虽然英文上都是 normal distribution

现有大量模型来描述 NDF，通常有 **Beckmann，GGX** 等（包括很多闫大佬的...但不适合于RTR）

##### Beckmann NDF

Beckmann 模型和高斯很像，但它是定义在 slope space 的，且这是个各向同性的模型，因此和 `\phi` 无关

其中 α 表示粗糙度，θ 表示半程向量h和法线n的夹角
$$
D(h) = \frac{e^{-\frac{tan^2\theta_h}{\alpha^2}}}{\pi\alpha^2cos^4\theta_h}
$$
由图可得，对于单位圆来说， tanθ 就等于切线上θ角覆盖的长度，当tanθ接近于无穷，θ就接近于90°，这就保证了无论tanθ 有多大，θ都不会超过90°，因此公式中使用了 tanθ

![image-20221124154253287](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124154253287.png)

##### GGX (or Trowbridge-Reitz) [Walter et al. 2007]

GGX 的特性是有**“长尾巴”**，即不同于Beckmann 的陡降，GGX 更为平滑，因此有着更接近真实的结果

![image-20221124155552976](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124155552976.png)

![image-20221124155634079](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124155634079.png)

##### Extending GGX [by Brent Burley from WDAS]

GTR (Generalized Trowbridge-Reitz)

有着可控的递减方式

![image-20221124155735048](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124155735048.png)



### Shadowing-Masking Term（几何项）

几何项计算了微表面自遮挡的情况，这意味着越靠近掠射越暗

shadowing ：从光源看被遮挡

masking：从相机看被遮挡

​																	![image-20221124155933446](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124155933446.png)		![image-20221124155940600](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124155940600.png)

几何项的目的是为了在掠射的情况下，让物体变暗，例如若没有G term，球体的边缘将是纯白色

![image-20221124160105881](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124160105881.png)

#### A commonly used shadowing-masking term

Smith shadowing-masking term 对 G term 进行了解耦，分成了 shadowing 和 masking 独立的两部分（事实上两者是有关联的，因此这是个假设）
$$
G(i, o, m) \approx G_1(i, m)G_1(o, m)
$$
由图发现，shadowing-masking term在 θ = 0 即垂直时，对计算结果无影响，但随着靠近掠射情况，就产生了巨大影响

![image-20221124162258535](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124162258535.png)

#### Missing energy!

虽然现有BRDF公式很好的模拟了自遮挡的效果，但随着roughness变大，结果反而逐渐变暗，出现了能量损失的情况

下图是white furnace test（白炉测试）：一个空的背景在均匀的环境光照下，结果是各处都是一样的，如果随着粗糙度增大，物体颜色和背景开始区分，说明有了能量损失

![image-20221124163020854](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124163020854.png)

##### Multiple Bounces

这是因为对于粗糙度较高的表面，会存在更深的“沟壑”，这反射光有更大的可能性被挡住

这意味着一个微表面多次弹射的可能性越大，若只考虑一次弹射的光照，那它损失的能量也就越多

![image-20221124163211400](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124163211400.png)

现有精确的办法[Heitz et al. 2016]在RTR中太慢了，于是有了一个想法：

**Basic idea：被遮挡 == 下一次 bounce 的发生**

#### The Kulla-Conty Approximation

kulla-conty 希望通过将损失的能量补全来还原应有的结果

它先计算一次bounce出来的能量，用 `dw = sinθdθdΦ` 进行换元，再用 `μ = sinθ` 换元得到下式
$$
E(\mu_o) = \int_0^{2\pi}\int_0^1f(\mu_o, \mu_i, \phi)\mu_id\mu_id\phi
$$

$$
\mu = sin\theta
$$

已知 E(μ _o) 是我们计算的光照结果，那我们**可以另加一个 lobe 计算 1 - E(μ _o) ，将此项视作能量损失的部分**，把它加到原有结果上，就弥补了能量损失

注意，不同入射方向计算的BRDF lobe 结果不同

由上述推导得出，我们需要加一个 lobe 计算  1 - E(μ _o) ，此时便需要引入一个新的 BRDF 使得结果能满足我们的需求

我们可以引入仍和函数来表示这个BRDF，但为了方便推导，同时考虑到对称性，BRDF的格式应如下，其中 c 指代其余的部分（即分母部分的式子），E_avg是个值
$$
c(1 - E(\mu_i))(1-E(\mu_o))
$$

$$
f_{ms}(\mu_o,\mu_i) = \frac{(1-E(\mu_o)(1-E(\mu_i)))}{\pi(1-E_{avg})}
$$

$$
E_{avg} = 2\int_0^1E(\mu)\mu d\mu
$$

在上述假设中，可使得下述推导成立
$$
\begin{equation}
\begin{split}
E_{ms}(\mu_o) &= \int_0^{2\pi}\int_0^1 f_{ms}(\mu_o, \mu_i, \phi)\mu_id\mu_id\phi \\
&= 2\pi\int_0^1 \frac{(1-E(\mu_o)(1-E(\mu_i)))}{\pi(1-E_{avg})}\mu_id\mu_i \\
&= 2\frac{1-E(\mu_o)}{1-E_{avg}} \int_0^1 (1-E(\mu_i))\mu_id\mu_i	\\
&= \frac{1-E(\mu_o)}{1-E_{avg}}(1 - E_{avg})			\\
&= 1 - E(\mu_o)
\end{split}
\end{equation}
$$
因此，通过上述的层层假设，最后可以发现，真正需要预计算的是E(μ)和Eavg，此处需要结合split sum的方法，对于一个复杂积分的预计算需要进行降维处理

E(μ) 仅和粗糙度和 μ 相关，Eavg只和 μ相关，因此可以打一张二维表作为预计算结果

![image-20221124172925545](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124172925545.png)

注意，这张表不同于split sum 所打的表，此表随着方向的不同会变化

![image-20221124173021711](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221124173021711.png)



#### What if the BRDF has color?

当物体存在颜色，意味着有光线被物体吸收，即存在能量损失

Kulla-Conty 的方法是先计算白色情况（即无能量损失），再乘以一个颜色损失的值作为结果

首先定义一个平均 Frensel 项（有多少能量被反射），这是一个值（此处用的是之前投影立体角的方法）
$$
F_{avg} = \frac{\int_0^1F(\mu)\mu d\mu}{\int_0^1 \mu d\mu} = 2\int_0^1 F(\mu)\mu d\mu
$$
再调用之前的 E_avg 表示有多少能量能被我们看见

因此，能 **directly** 看见的：
$$
F_{avg}E_{avg}
$$
经过 **one bounce** 可被看见的：
$$
F_{avg}(1 - E_{avg})\cdot F_{avg}E_{avg}
$$
经过 **k bounce** 可被看见的：
$$
F^k_{avg}(1 - E_{avg})^k \cdot F_{avg}E_{avg}
$$
将所有项加起来是个级数，化简后就是我们的 **color term**，最后把这个颜色项乘到之前无色的 **additional BRDF**上即可
$$
\frac{F_{avg}E_{avg}}{1-F_{avg}(1-E_{avg})}
$$
![image-20221127104554312](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221127104554312.png)

##### PS：直接对微表面 BRDF 结合一个 diffuse lobe 是错误的！！！

#### Linearly Transformed Cosines

用于处理 microfacet models 的着色，主要应用于GGX，但其他的也能使用

LTC 不计算阴影，主要是计算**多边形光源**下的着色

![image-20221128152008130](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128152008130.png)

##### Key idea

任何向外的 2D BRDF lobe 都能够转化为一个 cosine，通过这个转换矩阵也能把光源的形状跟着变换，在一个cosine lobe 上对转换后的光源积分，可以获得一个**解析解**

![image-20221128152241242](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128152241242.png)

##### Observations

随着BRDF转换为一个Cosine，方向和积分域都会随着转变
$$
BRDF \stackrel{M^{-1}}{\longrightarrow} Cosine \\
Direction:\omega_i \stackrel{M^{-1}}{\longrightarrow} \omega_i'	\\
Domain\ to\ integrate:P \stackrel{M^{-1}}{\longrightarrow} P'
$$
![image-20221128152837276](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128152837276.png)

![image-20221128153020553](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128153020553.png)

上述想法便能得到下式推导（注意变换后的ω可能不再在单位球上，因此要归一化），在推导过程中需要用到雅可比矩阵，**J** 代表 jacobi 项（雅可比项）：
$$
\omega_i = \frac{M\omega_i'}{||M\omega_i'||}
$$

$$
\begin{equation}
\begin{split}
L(\omega_o) &= Li \cdot \int_P F(\omega_i)d\omega_i	\\
			&= Li \cdot \int_P cos(\omega_i')d\frac{M\omega_i'}{||M\omega_i'||}	\\
			&=  Li \cdot \int_P cos(\omega_i')Jd\omega_i'
\end{split}
\end{equation}
$$

### Disney’s Principled BRDF

#### Motivation

事实上，并不存在能很好的表示真实材质的 PBR（例如在大多数微表面模型中都缺乏diffuse term）

其次，PBR 对艺术家们不够友好（因为有太多的物理量）

#### High level design goal

为了更直接地**满足艺术需求**，而不完全追求物理准确性，就有了迪士尼风格的 BRDF

但是，在RTR 中，Disney’s Principled BRDF 仍然能被视为PBR，因为 RTR 很多基于物理的地方都折衷了

#### What is “principled”?

使用直觉的而非物理的参数

参数尽可能少

参数应在 [0, 1]之间，在必要的适合允许超出这个范围

参数的结合应尽可能鲁棒，而非互斥

下图为一部分控制参数，自上而下分别是：

**subsuface（比 diffuse 更平均）、metallic（金属性）、specular、specularTint（越大越靠近底色）、roughness、anisotropic（各向异性）、sheen（绒毛感）、sheenTint（越大越靠近底色）、clearcoat（木板上刷清漆，多层材质，内部漫反射，外部specular）、clearcoatGloss（外部glossy）**

![image-20221128200946936](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221128200946936.png)

#### Pros and Cons

容易理解、控制

单一模型可以使用很多种材质

开源

非基于物理的（但不重要）

Huge 参数空间



### Non-Photorealistic Rendering (NPR)

**非真实感渲染等价于（fast and  reliable）风格化（stylization）**

#### Photorealistic Rendering

真实感渲染是为了实现逼近照片的图像

Focus：lighting，shadows，material，etc

![image-20221128203204346](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203204346.png)

#### Non-Photorealistic Rendeirng (NPR)

非真实感渲染的目标是实现艺术效果

例如下述的简笔画通过色块就表述出了阴影，虽然不真实，但在观感上能想象出其表达的内容

![image-20221128203245029](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203245029.png)

#### Characteristics of NPR

1. 源自真实感渲染
2. 利用抽象
3. 加强重要的部分

NPR 在某些情况下比 PR 有着更清晰的表达效果

#### Applications of NPR

Bold contours (actually, outlines) 加粗轮廓

Blocks of colors 色块

Strokes on surfaces 曲面上的线条

![image-20221128203517258](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203517258.png)

​																							[Atelier Ryza 2: Lost Legends & the Secret Fairy]

![image-20221128203622668](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203622668.png)

​																													[Xenoblade Chronicles 2]

![image-20221128203654749](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203654749.png)



#### Outline Rendering

##### Outlines are not just contours （边界线不仅仅只是指轮廓线）

[B]oundary / border edge （只邻接一个面的轮廓线）

[C]rease（折线）

[M]aterial edge（材质边界）

[S]ilhouette edge（邻接两个面的轮廓线）

![image-20221128203830520](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128203830520.png)

##### Outline Rendering -- Shading

通过法线和观察向量计算来对轮廓进行着色，当两者接近垂直时就加深表面

缺陷：线条不均匀

![image-20221128204214441](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128204214441.png)

##### Outline Rendering -- Geometry

对 backface 渲染时放大（fatten）一圈，对 frontface 正常渲染

可以直接对边进行 fatten，也可以对顶点朝法线方向 fatten

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128204418195.png" alt="image-20221128204418195" style="zoom:95%;" />			![image-20221128204427334](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128204427334.png)



##### Outline Rendering -- Image

直接在图片上进行边检测，通常使用滤波核进行图片处理

Sobel detector 就是对图片分别进行横向和竖向的查找，最后叠加获得

![image-20221128204634209](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128204634209.png)

![image-20221128204821135](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128204821135.png)



#### Color blocks

有两种方式：

Hard shading：在渲染过程中对着色设置 threshold，即渲染过程中进行 ”if else“

Posterization：延迟渲染，对最终图进行 ”if else“

并非二进制的，可能分多个段进行量化

![image-20221128205017215](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205017215.png)

![image-20221128205041763](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205041763.png)





![image-20221128205112295](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205112295.png)



#### Strokes Surface Stylization

例如素描的风格

##### Idea

用预计算的笔画材质来替换逐点着色

颜色的深度用材质的密度来表达

![image-20221128205333125](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205333125.png)

##### Tonal art maps (TAMs)

首先准备不同密度的材质，用以表达不同深度的颜色

**此处的 mipmap 不是取均值，而是确保各层图片的密度都一致**，从而应对不同距离的物体的绘制

![image-20221128205429835](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205429835.png)

![image-20221128205625043](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221128205625043.png)



#### Some Notes

NPR 是艺术驱使的，需要拥有将艺术家需求转移到渲染视角的能力，例如 edge

有时候每个部位都有着不同的风格

此外，**非真实感渲染的质量取决于它的真实感模型**



## Real-Time Ray Tracing

### In 2018, NVIDIA announced GeForce RTX series(Turing architecture)

RTRT的理论很早就有，但是2018年NVIDIA在硬件上的突破即 RTX，使得 RTRT 的实践成为了可能

![image-20221129134614997](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129134614997.png)

![image-20221129134633335](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129134633335.png)



#### What does RTX actually do?

RTRT 的方法就是由相机出发对每个像素采集一个样本进行着色 **1 sample per pixel （1 SPP）**

**1 SPP path tracing =  1 rasterization (primary) + 1 ray (primary visibility) + 1 ray (secondary bounce) + 1 ray (secondary vis.)**

主要就是光源打到primitive，primitive 判断可见性，primitive反射到另一个object，该object判断可见性

**总共四条光线组成一个SPP**

其中，第一步光源打到primitive的直接光照部分用了光栅化进行代替，即直接对所有像素进行第一次trace，从而避免了逐个trace

在离线的光线追踪中我们知道，1 SPP 获得的是有极大噪声的结果，**RTRT 的关键技术是 Denoising**

![image-20221129135254053](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129135254053.png)

#### State of the Art* Denoising Solution

![image-20221129135333540](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129135333540.png)

##### Goals (with 1 SPP）

我们希望RTRT能有着高质量（没有模糊、没有人为处理的痕迹、保留细节）同时快速（每帧小于2ms的降噪速度）

##### 但在现有的方法中，大多都不能满足这些需求：

Sheared filtering series (SF, AAF, FSF, MAAF, ...)

Other offline filtering methods (IPP, BM3D, APR, ...)

Deep learning series (CNN, Autoencoder, ...)	深度网络在目前的训练速度不能满足RT的要求，但未来不好说

### Industrial Solution

**Temporal!!!**   （工业上主要是使用**时间复用**的方法）

#### Key idea

假设前一帧的结果是已经降噪了的，然后我们要将前一帧的结果应用到当前帧的对应位置上

主要是使用一个叫 motion vectors 的向量来寻找之前的位置

通过每一帧复用前一帧的方式，来增大SPP的次数

​																					![image-20221129140052865](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129140052865.png)	![image-20221129140100205](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129140100205.png)

#### The G-Buffers（Geometry buffer）

G-buffer 中存储着在渲染过程中顺带获得（无消耗）的辅助信息

通常有深度、法线、世界坐标等

是基于屏幕空间的信息

![image-20221129141412361](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129141412361.png)

#### Back Projection

具体的计算方法是，先找到一个需要计算着色的像素位置 x ，可以直接调用这个像素在G-buffer上记录着的世界坐标，或者利用公式进行计算
$$
s = M^{-1}V^{-1}P^{-1}E^{-1}x
$$
此外，我们已知场景是怎么移动的，即移动矩阵 T 是知道的，那么便可以知道变换后的 s'
$$
s' = T^{-1}s
$$
再调用MVP进行变换到像素上即可获得前一帧的像素位置
$$
x' = P'V'M's'
$$
最后对两帧结果加权平均获得最终结果（其中 - 表示过滤后的，~ 表示过滤前的，没有表示无噪声的），α 通常为0.1 ~ 0.2，即80%~90% 是来自上一帧的
$$
\overline C^{(i)} = Filter[\widetilde C^{(i)}] \\
 C^{(i)} = \alpha \overline C^{(i)} + (1 - \alpha)  C^{(i-1)}
$$
![image-20221129140225155](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129140225155.png)

以下两张图就是降噪处理前后的结果

注意：虽然在图中感觉降噪后图片变明亮了，但是denoising 并不会影响图片的亮度信息，事实上两张图是一样亮的

主要是因为噪点的颜色数值可能超过了RGB的范围，对于非HDR屏幕，会直接将超过RGB范围的数值砍掉，就导致了结果看起来偏暗

![image-20221129141435312](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129141435312.png)

![image-20221129141451651](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129141451651.png)

和离线渲染结果比较发现，使用降噪的RTRT在部分OA上会存在问题，当总体效果已经很接近了

![image-20221129141753790](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129141753790.png)



### Temporal Failure

时间复用并不是总是起效的

Failure case 1: 场景切换 (burn-in period)

Failure case 2：面对一条长廊倒着走 (screen space issue)

Failure case 3：被遮挡的物体突然露出来了 (disocclusion)

![image-20221129143520562](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129143520562.png)

本质上都是当前帧的点在上一帧图上找不到对应信息

如果强行用复用的信息，会造成 Lagging（拖影）

#### Adjustments to Temp. Failure

##### Clamping：主要是增大现有帧在加权平均中的比例，或者说将上一帧的结果clamp到现有帧的结果

##### Detection：使用构件 ID 来区分侦察错误，如果计算后的上一帧的构件 ID和当前的不一致，就不使用上一帧信息

**两个方法都会再次引入噪声**，但能勉强克服上述问题；其中clamp是对噪声和拖影的一个tradeoff



#### More Temporal Failure

此外，不仅仅是在位置移动上回引起错误，着色也会引起错误

例如在移动光源下的栅栏的阴影着色，虽然屏幕内的物体位置信息都没变，但阴影始终在变换，复用上一帧就没用了

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129144146330.png" alt="image-20221129144146330" style="zoom:80%;" />

以及glossy材质上物体的移动，起反射的着色也难以复用

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221129144321045.png" alt="image-20221129144321045" style="zoom:80%;" />





### Implementation of Filtering

之前提了时间上的复用思路，接下来则讨论对每一帧 denoising 的具体方法

​														<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130104411922.png" alt="image-20221130104411922" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130104422321.png" alt="image-20221130104422321" style="zoom:80%;" />



#### idea

**首先假设我们使用一个（low-pass）filter 来滤波一张图片，去移除高频噪声**							

**同时假设我们用的是一个以 pixel i（2D）为中心的 Gaussian filter**

任何临近像素 i 的像素 j 都会对像素 i 做出贡献，贡献程度取决于它们的 **distance**

![image-20221130105640513](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130105640513.png)

**主要步骤：**对每个像素 i 寻找它周围的像素 j，计算它们的距离作为权重，权重乘以像素 j 的信息即为 j 对 i 的贡献内容，最后加权平均

```cpp
For each pixel i
    sum_of_weights = sum_of_weighted_values = 0.0
    For each pixel j around i
        Calculate the weight w_ij = G(|i - j|, sigma)
        sum_of_weighted_values += w_ij * C^{input}[j]
        sum_of_weights += w_ij
    C^{output}[I] = sum_of_weighted_values / sum_of_weights		// 标准化
```

##### Some Notes

1. 对每个权重求和，最后作为除数是为了**归一化结果**，这样就不用考虑滤波函数本身是否是归一的，只要考虑形状类似于高斯这种，随着 “distance” 衰减的即可

2. 在做归一化前要对权重和进行是否为 0 的判断

3. 像素 j 的颜色信息可以是多通道的，不影响计算过程

   ![image-20221130112836305](C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221130112836305.png)



#### Bilateral Filtering

对于高斯 filter 这种低通滤波器，过滤高频信息，就会导致图片的边界模糊化，但这边界是我们想保留的

![image-20221130111434719](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130111434719.png)

##### Observation

关于边界，可以发现这是色彩急剧变化的地方

##### Idea

双边滤波便考虑到一个方法：**如果像素 j 和 i 的颜色差异较大，则让 j 对 i 的贡献减小**

即对滤波核增加额外的控制

下式（i，j）（k，l）分别表示两个点的坐标
$$
\omega(i, j, k, l) = exp(-\frac{(i-k)^2 + (j-l)^2}{2\sigma_d^2} - \frac{||I(i,j) - I(k, l)||^2}{2\sigma_r^2})
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130112144244.png" alt="image-20221130112144244" style="zoom:80%;" />



#### Joint Bilateral Filtering

##### Observation

高斯滤波：一个度量（distance）

双边滤波：两个度量（pos distance & color distance）

那么是否能加上更多的条件呢，联合双边滤波就是这个答案，并在光线追踪渲染的 denoising 有着很好的效果

##### Unique advantages in rendering

联合双边滤波引入了world pos、Normal、Albedo 等作为控制，这些在 G-buffer 上是**免费获得的**

此外，**G-buffers 的信息是 noise-free 的**，因为它们不用考虑 multi-bounces

​											![image-20221130112648778](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130112648778.png)![image-20221130112658954](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130112658954.png)

##### Example

以下图为例

点 A 和点 B：颜色临近，主要通过深度来区分

点 B 和点 C：深度临近，主要通过法线来区分

点 D 和点 E：深度法线都临近，则通过颜色来区分（虽然可能会受噪点颜色的影响）

![image-20221130112945216](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130112945216.png)



#### Implementing Large Filters

当滤波核较大时，计算会引起很大的开销，有两种方法来克服这个问题

##### Solution 1: Separate Passes

对于一个高斯滤波，拆分为：先水平做一次过滤（1xN），再垂直做一次过滤（Nx1）

从而复杂度：N² → N + N

![image-20221130113622502](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130113622502.png)

为什么 2D 的高斯能拆成两个 1D 的高斯呢，因为在高斯的公式上变存在拆分的计算方式
$$
G_{2D}(x,y) = G_{1D}(x) \cdot G_{1D}(y)
$$
我们之前学过：filtering == convolution，两个函数相乘积分就是卷积过程，结合二重积分可拆分的方式，就得到下式
$$
\iint F(x_0, y_0)G_{2D}(x_0 - x, y_0 - y)dxdy = \int(\int F(x_0, y_0)G_{1D}(x_0 - x)dx)G_{1D}(y_0 - y)dy
$$
因此从公式方面也能法线，2D的高斯可拆成两个 1D 的高斯

理论上双边滤波不可拆分执行，因为 x 和 y 的函数没法简单的拆分开来，但在现实上会强行使用

##### Solution 2: Progressively Growing Sizes

“a-trous wavelet”

用不断增长的size来进行多次滤波，即每次相隔数目增加（第一排是临近的五个点，第二排是中间隔1的临近五个点）

间隔数目是 2^i 个（e.g. i = 5这层，原本为 64² → 5² x 5）

![image-20221130160242875](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130160242875.png)

**Q：为什么要使用不断增长的 size 呢？						  A：使用更大的滤波器 == 移除低频信息**

**Q：为什么隔几个样本进行采样也是安全的呢？			A：采样 == 重复频谱**

本质上就是每次过滤掉低频的信息，同时把现有频谱重复到前面被过滤掉的信号的位置

先做过滤是为了防止搬运后的信号和原有的重叠造成 Aliasing

如下，pass 1：把蓝色部分处的信息砍掉，则只保留下右图的实线部分；pass 2：开始采样，即将剩余部分的信息恰好搬运到虚线部分

![image-20221130160925121](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130160925121.png)



### Outlier Removal

Outlier 是指图像中出现了极亮的像素，对这些像素进行filtering，会导致平均后的范围仍然很亮，形成**blocky**

**思路是在 filtering 之前，先把这些 outliers 移除**

![image-20221130165723710](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130165723710.png)

#### Outlier Detection and Clamping

##### Outlier detection

对于每个像素，观察它附近 e.g. 7x7 的邻居，计算均值和方差，如果某个点不在 **[μ - kσ，μ + kσ]**，则认为是outlier

##### Outlier removal

本质上是使用 **clamp** 将 outlier 夹紧在 **[μ - kσ，μ + kσ]**，而不是直接把点移除



### Specific Filtering Approaches for RTRT

#### SVGF（Spatiotemporal Variance-Guided Filtering [Schied et al.]）

##### Basic Idea

SVGF 考虑了时空两方面的降噪方式，只是在此基础上额外加入了**方差的分析和一些tricks**

![image-20221130170725226](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130170725226.png)

##### Joint Bilateral Filtering

SVGF 使用联合双边滤波，并额外加入了 depth、normal、luminance三个度量

**Depth：**
$$
w_z = exp(-\frac{|z(p)-z(q)|}{\sigma_z|\nabla z(p)\cdot(p-q) + \varepsilon})
$$
A、B同平面，颜色近似，因此它们应彼此相互贡献，但A和B的对于相机的深度完全不同，就深度来度量会认为A、B之间无贡献

因此可以使用两者在切线空间（即法线方向）的深度梯度来进行衡量

表现在公式上，在切线空间▽z(p)是深度变化率，（p - q）是距离，相乘即为深度变化的值，从而深度较大时，深度梯度也较大，两者相除结果就变小了

![image-20221130171047530](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130171047530.png)

**Normal：**
$$
w_n = max(0, n(p)\cdot n(q))^{\sigma_n}
$$
幂次的作用类似于 specular 中的 ks，主要使曲线变化更陡峭

注意，若是法线贴图变化过于剧烈，人们会直接使用表面的宏法线

![image-20221130172157047](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130172157047.png)

**Luminance：**
$$
w_l = exp(-\frac{|l_i(p)-l_i(q)}{\sigma_l\sqrt{g_{3*3}(Var(l_i(p)))}+\varepsilon})
$$
此处将RGB转化为明亮度进行计算，本质没变

B对A的贡献计算可以用颜色，但以免B点噪点颜色的影响，通常先计算B附近的方差，若方差较大，则不应该相信A、B的颜色差异，式子中的分母是个标准差

计算方差：

1. 空间上计算 7x7 filter
2. 时间上用motion vector 找到上一帧的方差进行加权平均
3. 对结果再进行一次空间上的 3x3 filter

![image-20221130172532139](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130172532139.png)



##### Results

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130173625573.png" alt="image-20221130173625573" style="zoom:80%;" />



#### RAE（Recurrent denoising AutoEncoder [Chaitanya et al.]）

RAE 结合G-buffers，使用神经网络进行时间上的信息积累进行降噪

##### Key architecture design：

**AutoEncoder** (or U-Net) structure

**Recurrent** convolutional block

##### Recurrent block：

类似于残差网络，将当前层训练出的数据返回网络结合新的数据继续训练，从而保留时间上的信息

![image-20221130174745136](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130174745136.png)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130174802656.png" alt="image-20221130174802656" style="zoom:80%;" />



#### Comparison

在早期两个技术中，SVGF有着绝对性的优势，但随着tensor core对神经网络的加速，RAE可能胜过SVGF

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221130174818109.png" alt="image-20221130174818109" style="zoom:80%;" />



### Practical Industrial solutions

#### Temporal Anti-Aliasing (TAA)

TAA 主要是时间上复用之前帧的采样点，方式类似于RTRT中的motion vector，例如下图中不同颜色点分别代表不同帧，通过 temporal 的方式增加每个像素的采样点个数

![image-20221201122331024](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201122331024.png)

#### Notes on Anti-Aliasing

##### Additional note 1

MSAA (Multisample) vs SSAA (Supersampling)

超采样是真正的增大分辨率，即像素变多了，每个像素都进行一次着色，计算量的增加是实打实的

MSAA是对一个像素引入更多采样点，模拟增大分辨率，但虽然多次采样，每个像素仍然只是一次着色

![image-20221201122715342](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201122715342.png)

SSAA 是简单粗暴的，在大分辨率下渲染，随后压缩回原始分辨率；是极致的方案，但计算量庞大

MSAA 是性能的改进，每个primitive 只着色一次，且像素边上的采样点可被相邻像素复用

![image-20221201123006667](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123006667.png)

##### Additional note 2

image-based 反走样方式，现阶段最好的是SMAA (Enhanced subpixel morphological AA)

History: FXAA -> MLAA(Morphological AA) -> SMAA

主要就是根据图像识别原本应该是什么样子的，再计算划分后所占的像素百分比，用于颜色计算

![image-20221201123140030](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123140030.png)

##### Additional note 3

G-buffers 绝对不能进行 anti-aliasing 处理

#### Temporal Super Resolution

##### Super resolution (or super sampling)

DLSS 1.0：主要是靠深度信息纯猜测

DLSS 2.0：学习TAA，开始复用时间上的信息

##### Key idea of Deep Learning Super Sampling (DLSS) 2.0

虽然学习了 TAA 的复用技术，但是 clamp 的方式不适用于在DLSS上，因为DLSS本质还是个超采样方式，像素的增加是真实的，需要给更小的像素一个明确值

如果直接使用clamp，将细分后的像素颜色 clamp 到临近的颜色，最后会导致结果模糊

![image-20221201123614337](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123614337.png)

于是 DLSS 基于深度学习，让神经网络自己学习如何利用时间上的信息，即对于连续两帧的信息进行不断训练，得到拟合的信号结果

![image-20221201123810003](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123810003.png)

![image-20221201123922344](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123922344.png)

![image-20221201123934617](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123934617.png)

![image-20221201123944877](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201123944877.png)

##### An importance practical issue

DLSS 当下仍不能满足实时渲染 30ms/frame 的要求，但未来可期



#### Deferred Shading

延迟渲染主要是为了节省时间

Pass 1：将各种信息存储在 G-buffer 上

Pass 2：从 G-buffer 中拿取信息开始 shading

优点：避免了在渲染过程中将被覆盖掉的像素的颜色计算

缺点：仅保留屏幕信息，不能进行抗锯齿（但这能被TAA 或者 image-based AA 处理）



#### Tiled Shading

进一步优化，将屏幕划分成 32x32 的小块

由于光源随着距离衰减，单个光源并不能影响到所有像素，因此分完的小块记录能影响到它的光源数目，应用于后期计算即可

![image-20221201124813291](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201124813291.png)

#### Clustered Shading

Clustered Shading 在 Tiled Shading 上进一步划分成空间的网格

Clustered Shading 额外考虑了深度信息，部分光源影响的深度是有限的

![image-20221201125034065](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201125034065.png)

#### Level of Detail Solutions（LoD）

LoD 在 RTR 工业上也被称为 “cascaded”，主要是使用类似mipmap的方法应对不同距离的显示

##### Example

Cascaded shadow maps

Cascaded LPV

​								![image-20221201131009009](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201131009009.png)							<img src="C:\Users\chh320\AppData\Roaming\Typora\typora-user-images\image-20221201131018274.png" alt="image-20221201131018274" style="zoom:80%;" />

##### Key challenge

主要难点是不同层级的纹理之间的过渡，通常需要各级之间相互覆盖融合边界来处理

##### Another example: geometric LoD

预生成一系列简单模型，根据和相机的距离选择合适的去显示，用TAA 去处理artifacts，这就是 UE5 nanite 的基本原理

![image-20221201133123285](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221201133123285.png)



#### Global Illumination Solutions

事实上，没有哪个技术能完美实现全局光照的渲染，通常都是结合多个技术来实现

##### Software ray tracing

**使用 HQ（高质量）SDF 渲染近处的独立物体，用LQ（低质量）SDF渲染远处的场景，RSM用于聚光部分（手电筒）**

3D 网格中使用 probes（顶针）存储 irradiance

##### Hardware ray tracing

**不使用最初的几何，而是用低多边形代表**

Probes (RTXGI)

上述加粗部分就是 UE5 中的 Lumen 的基本原理



# Computer Graphics is Awesome！！！

### Yet still, a lot of uncovered topics

\- Texturing an SDF
\- Transparent material and order-independent transparency
\- Particle rendering
\- Post processing (depth of field, motion blur, etc.)
\- Random seed and blue noise
\- Foveated rendering
\- Probe based global illumination
\- ReSTIR, Neural Radiance Caching, etc.
\- Many-light theory and light cuts
\- Participating media, SSSSS
\- Hair appearance
\- ...
