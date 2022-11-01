# Games 101

## Transformation（变换）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121547860.png" alt="image-20220825121547860" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121606422.png" alt="image-20220825121606422" style="zoom:67%;" />

### 3D Transformation

##### **3D point = (x, y, z, 1)T** 

##### **3D vector = (x, y, z, 0)T** 

##### **(x, y, z, w) (w != 0)**  == **(x/w, y/w, z/w)**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121626188.png" alt="image-20220825121626188" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121644720.png" alt="image-20220825121644720" style="zoom:67%;" />

##### 3D 的任意旋转均可拆解为x、y、z轴的旋转

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121656389.png" alt="image-20220825121656389" style="zoom:67%;" />
$$
Rxyz(α, β, γ) = Rx(α) Ry(β) Rz(γ)
$$
#### 罗德里格斯旋转方程（Rodrigues）

 ![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820094111172.png)

#### 叉乘矩阵

 ![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820094156005.png)

### View / Camera Transformation

1. **m**odel transformation（在指定位置摆好模型）
2. **v**iew transformation（找个角度放好相机）
3. **p**rojection transformation（拍照）

### view transformation

#### 定义相机：地点位置 、所看方向、向上方向

##### The origin, up at Y, look at -Z 

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121901362.png" alt="image-20220825121901362" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121912938.png" alt="image-20220825121912938" style="zoom:67%;" />

#### PS：

由于逆时针与顺时针旋转为反操作，因而两者的矩阵互逆

而从推导的矩阵可得，逆时针旋转与顺时针旋转变换矩阵为转置关系

因而两者矩阵的转置矩阵等于其逆矩阵，即，原矩阵为正交矩阵

因而：可由坐标系旋转到目标方向，再进行转置获得逆矩阵

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121924160.png" alt="image-20220825121924160" style="zoom: 80%;" />



### Projection transformation

#### Orthographic projection(正交投影)

Camera located at origin, looking at -Z, up at Y 

Drop Z coordinate

Translate and scale the resulting rectangle to [-1, 1]²

##### 常用方法：即用一个长方体框定一个范围，随后映射到单位立方体，便于后期裁剪计算（右手系）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121939359.png" alt="image-20220825121939359" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825121950524.png" alt="image-20220825121950524" style="zoom:80%;" />

#### Perspective projection(透视投影)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122000978.png" alt="image-20220825122000978" style="zoom:80%;" />

1. 把Frustum压缩为cuboid（n -> n, f -> f)(Mpersp -> ortho)
2. 进行正交映射 (Mortho)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122039247.png" alt="image-20220825122039247" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122048345.png" alt="image-20220825122048345" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122058959.png" alt="image-20220825122058959" style="zoom:67%;" />

##### 寻找变换前后不变的点，作为参照，例如近平面的点，变换后坐标不变

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820095711953.png" alt="image-20220820095711953" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122111746.png" alt="image-20220825122111746" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122122191.png" alt="image-20220825122122191" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122132558.png" alt="image-20220825122132558" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122144357.png" alt="image-20220825122144357" style="zoom:67%;" />



## Rasterization(光栅化)：把 3d 几何形体显示在screen

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122155756.png" alt="image-20220825122155756" style="zoom:80%;" />

##### 将[-1, 1]² 映射为 [0, width] x [0, height] 的范围，并且时矩形的左下角位于坐标原点

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122204857.png)

### Sampling

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122221447.png" alt="image-20220825122221447" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122233645.png" alt="image-20220825122233645" style="zoom:67%;" />

```c++
// 在三角内的像素点inside函数返回1，否则返回0
// 判断是否在三角内的方法：Cross Products
for (int x = 0; x < xmax; ++x) 
	for (int y = 0; y < ymax; ++y) 
		image[x][y] = inside(tri, x + 0.5, y + 0.5);	// +0.5 为像素的中心位置
// 优化方法：在三角形的minX，maxX， minY， maxY的范围内遍历
```

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220723090343592.png" alt="image-20220723090343592" style="zoom:55%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122251380.png" alt="image-20220825122251380" style="zoom:62%;" />

##### 蓝色区域称为包围盒（bounding box)



### Anti-aliasing（反走样）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122305962.png" alt="image-20220825122305962" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122315642.png" alt="image-20220825122315642" style="zoom:67%;" />

#### Artifacts：锯齿、摩尔纹（手机拍显示器）、轮胎错觉（高速转动的车轮似乎在倒转）

#### Anti-aliased Sampling

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122327489.png)

##### MSAA：先滤波（模糊）再进行采样（不能交换顺序）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122335504.png" alt="image-20220825122335504" style="zoom:67%;" />



#### Aliasing（走样）原因：采样频率低于滤波频率

##### 在相同的采样频率下，频率越高的函数，走样越严重

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122345925.png)

##### 当两个不同频率的函数，在同一个采样方式下，获得的结果难以区分，即为Aliases（走样）

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122357663.png)

#### Filtering方法——Convolution（=Averaging）

##### 利用一个卷积单元进行卷积，即平均相邻值，从而进行模糊

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122405221.png" alt="image-20220825122405221" style="zoom:67%;" />

##### 空间域（时域）的卷积 = 频域的乘法（注意，卷积核要除以单元个数）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122421841.png" alt="image-20220825122421841" style="zoom:67%;" />

#### Box Function = “Low Pass” Filter

卷积核越大，获得的滤波频率越低

#### Sampling = Repeating Frequency Contents

采样在频域上表现为同个元素在不同时间点上进行复制

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122432222.png)

##### 当采样频率较低时，将导致相邻的图像进行重叠，导致走样。滤波（模糊）的作用为限制频率，从而在采样频率较低时仍能保证不会出现重叠

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122439673.png" alt="image-20220825122439673" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122450068.png" alt="image-20220825122450068" style="zoom:80%;" />

#### MSAA具体实现：

**Convolve** f(x,y) by a 1-pixel box-blur 

\- Recall: convolving = filtering = averaging 

**Then sample** at every pixel’s center

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122511986.png" alt="image-20220825122511986" style="zoom:67%;" />

##### 将单个像素化为2x2的supersampling

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122521986.png" alt="image-20220825122521986" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122531930.png" alt="image-20220825122531930" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122543069.png" alt="image-20220825122543069" style="zoom:67%;" />

#### 拓展：

##### FXAA(Fast Approximate AA)：在MXAA基础上，不将像素划分为标准的2x2，4x4等，而根据需要化为任意

##### TAA (Temporal AA) ：通过时间，本帧图像考虑上一帧图像，从变化中找边界

##### Super resolution（超分辨率）：DLSS，深度学习采样，即让计算机猜测像素周边的情况





## Z-buffering

```c++
// 时间复杂度 O(n)
for (each triangle T)
	for (each sample (x,y,z) in T)
		if (z < zbuffer[x,y]) // closest sample so far
			framebuffer[x,y] = rgb; // update color
			zbuffer[x,y] = z; // update depth
		else
			; // do nothing, this sample is occluded
```

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122638541.png" alt="image-20220825122638541" style="zoom:67%;" />



## Shading 着色

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825122651303.png" alt="image-20220825122651303" style="zoom:67%;" />

### Blinn-Phong 反射模型

#### 漫射光

漫反射面以半球形像各个方向传播的相同光
$$
Ld = kd (I/r²) max(0, n · l)
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220706134933183.png" alt="image-20220706134933183" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220706134957453.png" alt="image-20220706134957453" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220706135611695.png" alt="image-20220706135611695" style="zoom:67%;" />



#### 高光

当观测角度与反射角度邻近时，会看到高光

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724142227988.png" alt="image-20220724142227988" style="zoom:67%;" />

##### 为简化观测向量v与反射向量R的比较，改用法线向量n与半程向量h的比较

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724142451799.png" alt="image-20220724142451799" style="zoom:67%;" />

##### 指数p：为了限制邻角的大小，只有特别靠近时，才能看到高光

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724142536275.png" alt="image-20220724142536275" style="zoom:80%;" />

#### 环境光

Blinn-Phong 模型假设任意位置环境光相同

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724142819280.png" alt="image-20220724142819280" style="zoom:67%;" />



#### Blinn-Phong 反射模型

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724142852347.png" alt="image-20220724142852347" style="zoom:67%;" />



### Shading Frequency 着色频率

**Flat shading 平面着色：每个三角面求向量**

**Gouraud shading 高洛德着色 ： 每个点着色**

**Phong shading ： 每个像素着色**

当模型面足够复杂，三角面足够多时，平面着色仍能取得好的效果，且计算量可能超过像素着色

#### Gouraud shading

对于点的向量，可以求相邻面的各自法线向量，然后求简单平均，或加权平均（根据面积）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724143550869.png" alt="image-20220724143550869" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724143558749.png" alt="image-20220724143558749" style="zoom:80%;" />

#### Phong shading 

对于各个像素的向量，可以采用计算插值，再归一化

 <img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724143750093.png" alt="image-20220724143750093" style="zoom:50%;" />

### Graphics (Real-time Rendering) Pipeline

即三维点到面上着色的全过程

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724143835283.png" alt="image-20220724143835283" style="zoom:80%;" />

### 材质匹配

任意model上的材质面均可展开为一张材质贴图，寻找体上三角形在uv图上的坐标对应即可

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144204313.png" alt="image-20220724144204313" style="zoom:80%;" />

同一材质会阵列使用，可以无缝拼接的称为 **tileable 材质**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144317037.png" alt="image-20220724144317037" style="zoom:67%;" />



### Barycentric Coordinates 重心坐标

1. ***α* + *β* + *γ* = 1** 表示点与三角形在同个平面上
2. ***α*、*β*、*γ* 均非负数** 表示点在三角形内部

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144454262.png" alt="image-20220724144454262" style="zoom:50%;" />

**坐标公式**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144711143.png" alt="image-20220724144711143" style="zoom:50%;" />

**特殊情况：形心**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144720322.png" alt="image-20220724144720322" style="zoom:50%;" />

**公式简化：采用向量插值求面积**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144826768.png" alt="image-20220724144826768" style="zoom:67%;" />

**可利用重心坐标求任意属性的插值，注意重心坐标不具备投影不变性，投影过后重心可能产生变化**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724144920074.png" alt="image-20220724144920074" style="zoom:50%;" />



### Applying Textures

```c++
for each rasterized screen sample (x,y):				// Usually a pixel’s center
	(u,v) = evaluate texture coordinate at (x,y)		// Using barycentric coordinates!
	texcolor = texture.sample(u,v);
	set sample’s color to texcolor;
```

#### Texture Magnification 纹理偏小

由于屏幕分辨率高，图片分辨率小，屏幕上每个像素对应图片的位置可能为小数，常采用均值处理，没了平滑过渡，可采用**Bilinear**，找到对应点的邻近四个点求插值，而非只平均为邻近单个点 

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724145401413.png" alt="image-20220724145401413" style="zoom:50%;" />

#### Texture Magnification 纹理偏大

当纹理分辨率过高时，屏幕中的部分像素会对应纹理中较大的范围，求平均值易导致走样

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724145653743.png" alt="image-20220724145653743" style="zoom:67%;" />

使用超采样可以克服，但是耗费巨大，常采用**mipmap**

#### Mipmap

mipmap逐层像素缩小为前一层的一半，最终多耗费 **1 / 3的空间**，开销少

mipmap速度快、是种近似的估计，只适用于方形

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724145940212.png" alt="image-20220724145940212" style="zoom:67%;" />

##### 操作方法：

寻找屏幕中指定点在纹理中的对应位置，根据纹理上的对应屏幕单个像素的距离L，模拟范围，观察 L 的长度，若为 1x1 则对应屏幕单个像素，若为 2x2 则对应纹理第二层，以此类推（4x4, 8x8...)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724150438669.png" alt="image-20220724150438669" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724150450508.png" alt="image-20220724150450508" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724150348711.png" alt="image-20220724150348711" style="zoom:67%;" />

##### mipmap缺陷：

mipmap仅适用于方形区域，当遇到横跨多个区域的长条形，会导致过度模糊

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724151001342.png" alt="image-20220724151001342" style="zoom:67%;" />

##### Ripmaps

多耗费 3倍的空间，生成单侧压缩的情况

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220724151052236.png" alt="image-20220724151052236" style="zoom: 80%;" />

### Applications of Textures

#### Environment Map

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085304201.png" alt="image-20220809085304201" style="zoom:67%;" />

#### Environmental Lighting

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085328656.png" alt="image-20220809085328656" style="zoom:67%;" />

#### Spherical Environment Map

缺陷是展开后，靠近极点位置会扭曲

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085357000.png" alt="image-20220809085357000" style="zoom:67%;" />

#### Cube Map

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085430582.png" alt="image-20220809085430582" style="zoom:67%;" />

#### Bump Mapping 凹凸贴图

引入一个凹凸贴图，扰动原位置的法线，从而生成凹凸的视觉效果

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085604785.png" alt="image-20220809085604785"  />

• 原面法线 n(p) = (0, 1) 

• dp = c * [h(p+1) - h(p)] 

• 扰动后法线 n(p) = **(-dp, 1)**.normalized()

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809085643199.png" alt="image-20220809085643199" style="zoom:67%;" />

三维视角的扰动

• 原面法线 n(p) = (0, 0, 1) 

• 扰动 p （u、v方向求偏导）

 dp / du = c1 * [h(**u**+1) - h(**u**)] 

 dp / dv = c2 * [h(**v**+1) - h(**v**)] 

• 扰动后法线 n = **(-dp/du, -dp/dv, 1)**.normalized() 

#### **Displacement mapping** 

凹凸贴图只能实现视觉上的凹凸，在边缘部分会露馅，Displacement mapping 对面片进行了真正的位移

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809090222451.png" alt="image-20220809090222451" style="zoom:67%;" />



### Shadow Mapping（点光源）

原理：一个点不在阴影中，意味着它既可以被相机看到，也可以被光源看到

步骤：

1. 由光源出发进行一次光栅化，获得 Z-buffer 图
2. 再由相机出发，将相机看到的点投影到光源的 Z-buffer 图，比较Z-buffer 图上的距离与该点到光源的实际距离
3. 若相等，则代表不在阴影中，不相等，则代表在阴影中

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820085731019.png" alt="image-20220820085731019" style="zoom: 67%;" />

缺陷：当shadow mapping分辨率较低时，容易生成锯齿阴影。由于距离是浮点数，比较大小困难，因而图上存在误差

​									<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820090136429.png" alt="image-20220820090136429" style="zoom:71%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220820090121368.png" alt="image-20220820090121368" style="zoom:67%;" />

## Geometry

### Represent Geometry 几何表示

Best Representation Depends on the Task !

#### **Implicit** 

• algebraic surface 	代数曲面

• level sets 				  水平集合

• distance functions   距离函数

#### **Explicit** 

• point cloud 			    点云

• polygon mesh 		   多边形网格

• subdivision, NURBS   细分、Nurbs曲面

#### “Implicit” Representations of Geometry

隐式表示通常使用一个函数，e.g ： f(x,y,z) = 0，某点小于0代表在内部，大于0在外部，等于0则刚好在面上

优点：可以轻松判断某个点是否在该面上

缺点：难以轻易想象出所表示几何的形状

#### “Explicit” Representations of Geometry

所有点都是直接给出的，或**via parameter mapping**（参数映射）给出

优点：可轻易得到点在面中的位置

缺点：难以判断某点是否在面上

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809091229186.png" alt="image-20220809091229186" style="zoom:80%;" />

#### Implicit Representations in Computer Graphics

##### Algebraic Surfaces (Implicit)

可用于简单几何，不适用于复杂几何

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809091654825.png" alt="image-20220809091654825" style="zoom:67%;" />

##### Constructive Solid Geometry (Implicit)——CSG

使用几何的布尔操作拼接出复杂的几何

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809091730648.png" alt="image-20220809091730648" style="zoom:67%;" />

##### Distance Functions (Implicit)

对于逐渐 blend 的曲面

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809091942679.png" alt="image-20220809091942679" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809092006070.png" alt="image-20220809092006070" style="zoom:80%;" />

##### Level Set Methods (implicit)

闭合等式难以表达复杂的形状

水平集通过寻找 interpolated values（插值）等于0的方式来生成曲面

![image-20220809092159509](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809092159509.png)

水平集可应用于医疗影响，例如通过恒定的组织密度进行识别

##### Fractals (Implicit) 分形

类似于递归的复杂几何

![image-20220809092524418](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809092524418.png)

#### Implicit Representations - Pros & Cons

##### Pros: 

• 紧凑的表述 (e.g., a function) 

• 具体查询容易 (inside object, distance to surface) 

• good for ray-to-surface intersection (more later) 

• 对于简单的形状，精确的描述/无采样误差

• 易于处理拓扑结构中的变化 (e.g., fluid) 

##### Cons: 

• 很难模拟复杂的形状

#### Explicit Representations in Computer Graphics

##### Point Cloud (Explicit)

容易表达各种几何

是最简单的表示方法：通过点列表（x、y、z）

对于大数据集很有用 (>>1 point/pixel) 

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809093025325.png" alt="image-20220809093025325" style="zoom:80%;" />

##### Polygon Mesh (Explicit)

更易于进行处理/模拟，自适应采样

更复杂的数据结构

使用较多

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809093240475.png" alt="image-20220809093240475" style="zoom:67%;" />

#### The Wavefront Object File (.obj) Format

v：点的x、y、z坐标

vt：材质u、v坐标

vn：法线坐标

f：面，按顺序为 点/材质/法线

![image-20220809094017059](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094017059.png)



### Curves

#### Bézier Curves (贝塞尔曲线)

##### Defining Cubic Bézier Curve With Tangents

特点，起始p0，沿着p0-p1方向，终点p3，沿着p2-p3方向

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094328558.png" alt="image-20220809094328558" style="zoom:50%;" />

#### Bézier Curves – de Casteljau Algorithm

Run the same algorithm for every **t** in [0,1]

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094514124.png" alt="image-20220809094514124" style="zoom:80%;" />

##### **Four** **input points in total**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094607609.png" alt="image-20220809094607609" style="zoom:50%;" />

##### Evaluating

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094825286.png" alt="image-20220809094825286" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094841795.png" alt="image-20220809094841795" style="zoom:80%;" />

##### Bernstein form of a Bézier curve of order n:

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809094949802.png" alt="image-20220809094949802" style="zoom:67%;" />

##### Bernstein polynomials:

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809095003362.png" alt="image-20220809095003362" style="zoom:80%;" />

#### Bézier Curves 的特性

凸包性：控制的曲线总是在控制点的凸包范围内



#### Piecewise Bézier Curves （分段贝塞尔曲线）

由于控制点较多时，曲线难以控制，引入分段

断点处平滑相交，需要切线方向一致，控制点距离相等

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809095958394.png" alt="image-20220809095958394" style="zoom:55%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809100109497.png" alt="image-20220809100109497" style="zoom:55%;" />

#### Spline （样条曲线）

控制点在曲线上，局部调整不会影响整体

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809100228871.png" alt="image-20220809100228871"  />



### Surfaces

#### Bézier Surfaces

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809100417516.png)

使用4x4的控制点，输出是在 [0,1]2 中由 (u，v) 参数化的二维曲面

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809100944554.png" alt="image-20220809100944554" style="zoom:80%;" />

#### Method: Separable 1D de Casteljau Algorithm

• 使用 de Casteljau 算法计算四条曲线上的位置 u，用 u 位置的四个控制点生成贝塞尔曲线

• 使用 1D de Casteljau 算法计算生成的贝塞尔曲线的点 v

![image-20220809100810308](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809100810308.png)



### Mesh Operations: Geometry Processing

#### Mesh subdivision（upsampling）  网格细分

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101239905.png" alt="image-20220809101239905" style="zoom:80%;" />

#### Mesh Simplification (downsampling)  网格简化

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101316033.png" alt="image-20220809101316033" style="zoom:80%;" />

#### Mesh Regularization (same #triangles)  网格正则化

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101336871.png" alt="image-20220809101336871" style="zoom:80%;" />



#### Subdivision 细分

##### Loop Subdivision （Loop定义的细分）适用于三角面

首先将三角面一分为四

![image-20220809101458072](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101458072.png)

For new vertices：对旧点加权平均

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101540893.png" alt="image-20220809101540893" style="zoom:67%;" />

For old vertices：对相邻旧点和自身加权平均

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101617619.png" alt="image-20220809101617619" style="zoom:67%;" />



##### Catmull-Clark Subdivision (General Mesh) 适用于任意面

首先，寻找非四分面与奇异点，奇异点为度不为4的点

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809101908105.png" alt="image-20220809101908105" style="zoom:67%;" />

随后，在细分过程中，非四分面中寻找一个点与各边中点相连，从而消去所有非四分面，并额外生成两个奇异点

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102041901.png" alt="image-20220809102041901" style="zoom:67%;" />

继续细分，始终只有四分面，且奇异点个数不变

​									<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102323638.png" alt="image-20220809102323638" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102330968.png" alt="image-20220809102330968" style="zoom:67%;" />

##### **FYI**: Catmull-Clark Vertex Update Rules (Quad Mesh)

![image-20220809102506239](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102506239.png)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102510087.png" alt="image-20220809102510087" style="zoom:80%;" />

![image-20220809102603640](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102603640.png)

​							

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102616951.png" alt="image-20220809102616951" style="zoom:80%;" />

![image-20220809102728858](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102728858.png)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809102745054.png" alt="image-20220809102745054" style="zoom:80%;" />

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809103123841.png)



#### Mesh Simplification

边缘坍塌（两点合并）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809103340206.png" alt="image-20220809103340206" style="zoom:67%;" />

##### Quadric Error Metrics

Quadric Error：新顶点应最小化其与先前相关三角形平面的平方距离之和（类似于MSE）

![image-20220809103525154](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220809103525154.png)

##### Simplification via Quadric Error

迭代坍塌边缘：使用最小堆/优先队列，每次选择代价最小的边，并更新相邻边



## Ray Tracing

#### Rasterization couldn’t handle global effffects well

光栅化虽然 fast ，但对于软阴影、以及多次弹射的光照难以处理

#### Ray tracing is accurate, but is very slow

光栅化是实时的（1秒30帧），光线追踪是离线的



### Basic Ray-Tracing Algorithm

#### Ray Casting

相机向每个像素投射一条射线到物体，计算该交点的着色，生成图像

若该点也可被光源看见，代表不在阴影中

![image-20220824101538922](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824101538922.png)

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824101626203.png)



#### Recursive（Whitted-Style） Ray Tracing

光线遇到物体会经过弹射继续传播，递归计算弹射后每个点的着色，最后求和作为像素的着色情况

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824102051225.png)

### Ray-Surface Intersection

#### Ray Equation

**o** 和 **d** 均为向量表示， t 为时间

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824102545257.png" alt="image-20220824102545257" style="zoom:67%;" />	<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824102615188.png" alt="image-20220824102615188" style="zoom:80%;" />



#### Ray Intersection With Sphere

假设射线与物体表面的交点为 **p**，根据几何的隐式表示 **f(x) = 0**，解方程即可得交点，即：
$$
f(p) = 0--> f(o + td) = 0
$$
<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824102840715.png" alt="image-20220824102840715" style="zoom:80%;" />

#### Ray Intersection With Triangle

若单纯计算射线与每个三角面的相交情况，计算量过于复杂，可简化为：

**射线与平面是否相交，再判断交点是否在三角形内**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824103352182.png" alt="image-20220824103352182" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824103512378.png" alt="image-20220824103512378" style="zoom:80%;" />

**平面可由一个法向量和一个点进行确定，而平面上其他任一点与该点的连线必定与法向量垂直**，则：

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824103739375.png" alt="image-20220824103739375" style="zoom:80%;" />



##### Möller Trumbore Algorithm

使用重心坐标来直接计算射线与三角面是否有交点

当***α* + *β* + *γ* = 1** 表示点与三角形共面，***α*、*β*、*γ* 均非负数** 表示点在三角形内部

解出 t、b1、b2三个未知数，若b1、b2、1 - b1 - b2均大于0，则表示与三角面相交

![image-20220829095340217](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220829095340217.png)



#### Accelerating Ray-Surface Intersection——Bounding Volumes

若射线能与物体相交，则它必然先与该物体的包围盒相交，进而过滤不必要的计算

##### <img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824104805839.png" alt="image-20220824104805839" style="zoom:80%;" />

##### Axis-Aligned Bounding Box (AABB)

AABB 包围盒由三对沿着x、y、z轴的平面包围生成，方便计算

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824104843008.png" alt="image-20220824104843008" style="zoom:67%;" />

**射线只有进入每一对平面，才进入盒子中**

**射线只要出了任一对平面，则就已经离开了盒子**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824105023081.png" alt="image-20220824105023081" style="zoom: 80%;" />



![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824105220734.png)

若**t(enter) < t(exit)** 表面射线进入过物体，若 **t(enter) < 0 && t(exit) > 0 ** 表面光源在物体内，若 **t(exit) < 0** 表示物体在射线后，无相交

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824110118205.png" alt="image-20220824110118205" style="zoom:80%;" />

使用AABB的好处，可简化计算的维度



### Uniform Spatial Partitions (Grids)

步骤：

1. 寻找总的包围盒
2. 创建轴网
3. 记录与物体表面相交的格子部分
4. 比较射线所经过的格子与物体所覆盖的格子是否重合，若是则进一步比较有无相交

缺陷：不适用于复杂度不均匀的场景

​								<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824110525030.png" alt="image-20220824110525030" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824110433502.png" alt="image-20220824110433502" style="zoom:67%;" />

### Spatial Partitions

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824110806448.png" alt="image-20220824110806448" style="zoom:80%;" />

八叉树：每次将选择的部分均等的划分

KD 0树：每次选择一条轴进行切分成相对均匀的部分

#### KD Tree Pre-Processing

叶子结点记录具体数据，非叶子结点记录结构

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824111101633.png" alt="image-20220824111101633" style="zoom:80%;" />

分别计算射线与各个分区的相交部分，若射线经过了某个分区，则进一步计算射线与该分区内的物体是否相交

**缺陷：若一个物体横跨多个分区，则每个分区都需要记录该物体的数据，从而导致重复存储**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824111230292.png" alt="image-20220824111230292" style="zoom:80%;" />



### Object Partitions & Bounding Volume Hierarchy (BVH)

BVH 在 KD 树的基础上，不是划分总包围盒的区域，而是递归地将物体均匀的划分集合，重新计算各自的包围盒

优势：避免了同个物体的重复存储

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220824111449719.png" alt="image-20220824111449719" style="zoom:80%;" />

划分方法：

1. 可总是选择最长轴进行切分
2. 可选择中位数的位置进行切分

切分终止标准：当结点包含少量元素时停止（例如：包含五个三角面时）

```c++
Intersect(Ray ray, BVH node) {
	if (ray misses node.bbox) return;	// 和外部包围盒没交点
    
    if (node is a leaf node)			// 叶子结点直接计算是否与物体相交
    	test intersection with all objs;
    	return closest intersection;
    
    hit1 = Intersect(ray, node.child1);	// 递归遍历子树
    hit2 = Intersect(ray, node.child2);
    
    return the closer of hit1, hit2;
}
```

### Spatial vs Object Partitions

#### Spatial partition（e.g.KD-tree）

空间被划分为不重叠的几个部分

一个object可能被多个区域包含

#### Object partition (e.g. BVH)

将 objects 划分为不相交的子集

划分后的包围盒可能相互重叠



### Radiometry（辐射度量学）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825094334917.png" alt="image-20220825094334917" style="zoom:80%;" />

#### Radiant Energy and Flux (Power)

Radiant Energy 是电磁辐射的能量，以焦耳为单位

Radiant flux (power) 是单位时间散发的能量，可视为功率，以瓦特（Watt) 或 流明（lm) 为单位

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825091159632.png" alt="image-20220825091159632" style="zoom:80%;" />

#### Radiant Intensity

由一个点光源散发出的在单位立体角上的能量

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825091356000.png" alt="image-20220825091356000" style="zoom:67%;" />

##### Angles and Solid Angles

Angle：圆弧长度与半径之比（弧度制）

Solid Angle：球面上的区域面积与半径的平方之比

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825091514028.png" alt="image-20220825091514028" style="zoom: 67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825091609645.png" alt="image-20220825091609645" style="zoom:67%;" />

##### Differential Solid Angles

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825093702638.png" alt="image-20220825093702638" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825093810541.png" alt="image-20220825093810541" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825093949948.png" alt="image-20220825093949948" style="zoom:80%;" />



#### Irradiance

表面上某个点的单位面积入射功率

Radiant Intensity不会衰减，因为立体角始终不变，Irradiance随着距离会衰减

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825094736892.png" alt="image-20220825094736892" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825101134550.png" alt="image-20220825101134550" style="zoom:80%;" />

#### Radiance

是由每单位立体角、每投影单位面积的表面发射、反射、传输或接收的功率。

Radiance 具有方向，而 Irradiance 来自四面八方，没有具体方向

Incident Radiance（入射辐射） 是每单位立体角的 Irradiance

Exiting Radiance（出射辐射）是每投影单位面积的 Intensity

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825095153535.png" alt="image-20220825095153535" style="zoom:67%;" />

#### Irradiance vs. Radiance

Irradiance ： 由 dA 获得的所有power

Radiance ： 由 dA 获得的来自 dw 的power

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825100133793.png" alt="image-20220825100133793" style="zoom:67%;" />



### Bidirectional Reflectance Distribution Function （BRDF）

BRDF 表示有多少光从每个入射方向射入，又有多少光反射到了每个出射方向 <img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825102009316.png" alt="image-20220825102009316" style="zoom: 80%;" />

#### Reflection Equation

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825102101945.png" alt="image-20220825102101945" style="zoom:80%;" />

#### Rendering Equation

在反射光的基础上 + 自身发出的光Le

即 **Lo = Le + Lr**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825102217478.png" alt="image-20220825102217478" style="zoom:80%;" />

### Understanding the Reflflection Equation

反射光 Lr 可视为 X 点自身发出的光 Le + 入射光再反射后的光 Li

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103354797.png" alt="image-20220825103354797" style="zoom:80%;" />

当有多个点光源时，则对 Li 进行求和

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103506519.png" alt="image-20220825103506519" style="zoom:80%;" />

若存在面光源，可视为无数个点光源的集合，因而进行积分

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103534673.png" style="zoom:80%;" />

其中，反射光 Li 存在递归，是未知的

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103634451.png" alt="image-20220825103634451" style="zoom:80%;" />

因而对方程进行简化，其中L，E是向量，K是光传输矩阵

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103737044.png" alt="image-20220825103737044" style="zoom:80%;" />

利用可逆矩阵和级数展开

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825103959360.png" alt="image-20220825103959360" style="zoom:80%;" />

从最终结果得，反射光 L 由点自身光E，获得的直接照射光KE，以及间接照射光组成

Rasterization 只能处理前两部分，因而损失了能量，自此需要引入光线追踪

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825104013571.png" alt="image-20220825104013571" style="zoom:80%;" />



### Monte Carlo Integration

在 x 上采样，则必须在 x 上积分

样本越多，方差越小

![image-20220825135050760](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825135050760.png)

蒙特卡洛积分在图形学角度，即通过多次采样，取得的平均值近似函数在区间内的面积，从而得到积分的值

除以PDF，是为了抵消掉不均匀带来的影响。例如某个区域会有很多样本，那就除以该位置的PDF，以削弱其权重

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825131546193.png" alt="image-20220825131546193" style="zoom: 67%;" />

### Path Tracing

Whitted-Style Ray Tracing 的缺陷：

只执行镜面反射或折射，例如 Glossy 反射不知如何处理

遇到漫反射的物体就停止弹射

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825135752891.png" alt="image-20220825135752891" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825135807442.png" alt="image-20220825135807442" style="zoom:80%;" />

虽然Whitted-Style Ray Tracing 是错误的，但渲染方程是正确的

使用数值方法计算渲染方程的积分，假设物体自身不发光

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825140538863.png" alt="image-20220825140538863" style="zoom:80%;" />

**注意：每个观察点若射出多条射线，在递归过程中会出现计算爆炸的现象，因而Path tracing 假设只射出一条射线（虽然有噪声，但是结果正确）**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825141059589.png" alt="image-20220825141059589" style="zoom: 80%;" />

对于一条射线的噪声，只要在每个像素追踪更多路径，并平均它们的亮度即可

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825141454181.png" alt="image-20220825141454181" style="zoom:80%;" />

此时虽然结果正确，但当SPP过少时，容易有噪声，若提高SPP，又容易不够高效，因为当光源较小时，大量的射线被浪费了

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825143501440.png" alt="image-20220825143501440" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825143533542.png" alt="image-20220825143533542" style="zoom:80%;" />

#### Russian Roulette (RR)

由于现实中光的弹射次数是无限的，在计算机上的计算必然会损失能量，因而引入俄罗斯轮盘赌

设定一个概率 P (0 < P < 1)

在概率 P 下，射出一条射线，返回着色结果 / P（Lo / P）

在概率 1-P 下，不射出射线，返回 0

此时期望：**E = P * (Lo / P) + (1 - P) * 0 = Lo**

```python
shade(p, wo)
    Manually specify a probability P_RR							# RR 部分
	Randomly select ksi in a uniform dist. in [0, 1]
	If (ksi > P_RR) return 0.0;

	Randomly choose one directions wi~pdf(w)					# 注意，是一条射线
	Trace a ray r(p, wi)
	If ray r hit the light
		Return L_i * f_r * cosine / pdf(wi)	/ P_RR				# 如果射线击中了光源，则直接计算，注意除以P_RR
	Else If ray r hit an object at q
    	Return shade(q, -wi) * f_r * cosine / pdf(wi) / P_RR	# 如果射线击中了物体，则递归计算，-wi是因为假设每个点的光线都从点出发

ray_generation(camPos, pixel)
    Uniformly choose N sample positions within the pixel
    pixel_radiance = 0.0
    For each sample in the pixel
        Shoot a ray r(camPos, cam_to_sample)
        If ray r hit the scene at p
            pixel_radiance += 1 / N * shade(p, sample_to_cam)	# 注意第二个参数的方向
    Return pixel_radiance
```

#### Sampling the Light (pure math)

如果对光源进行采样，就可避免大量射线被浪费的情况

pdf = 1 / A ( ∫pdf dA = 1）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825143921862.png" alt="image-20220825143921862" style="zoom:80%;" />

​						<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825144044073.png" alt="image-20220825144044073" style="zoom: 80%;" />			<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220825144054204.png" alt="image-20220825144054204" style="zoom: 80%;" />

```python
shade(p, wo)
    # Contribution from the light source.
    Uniformly sample the light at x’ (pdf_light = 1 / A)
    Shoot a ray from p to x’
	If the ray is not blocked in the middle
    	L_dir = L_i * f_r * cos θ * cos θ’ / |x’ - p|^2 / pdf_light
    
    # Contribution from other reflectors.
    L_indir = 0.0
    Test Russian Roulette with probability P_RR
    Uniformly sample the hemisphere toward wi (pdf_hemi = 1 / 2pi)
    Trace a ray r(p, wi)
    If ray r hit a non-emitting object at q
    	L_indir = shade(q, -wi) * f_r * cos θ / pdf_hemi / P_RR
        
    Return L_dir + L_indir
```



### Material == BRDF

关于计算漫反射材质的BRDF

假设入射光都是均匀的，且object 不吸收光，则根据能量守恒，入射的radience和出射的radience相等

通过渲染方程，由于此时BRDF是常数，Li也是常数，简化方程后可得如下等式

此时若需要 Li = Lo，则 fr 即 BRDF 需等于 1 / pi（该情况下为不吸收能量的BRDF）

在此基础上引入一个 0 到 1 的反射率 albedo，进而能够引入不同颜色的 BRDF

综上，BRDF的范围为 0 ~ 1/pi

![image-20220830104934639](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830104934639.png)



#### Glossy material (BRDF)

类似镜面反射，但又更为粗糙

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830105525010.png" alt="image-20220830105525010" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830105538796.png" alt="image-20220830105538796" style="zoom:67%;" />



#### Perfect Specular Reflection

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830105655296.png" alt="image-20220830105655296" style="zoom:80%;" />

#### Specular Refraction

#### Snell's Law

**Snell 法则：入射角度的正弦值 x 原介质的折射率 == 折射角度的正弦值 x 入射后介质的折射率**

注意：当根号内的值小于0时，意味着不存在折射，即全反射现象（当原介质折射率大于入射介质时）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830105828222.png" alt="image-20220830105828222" style="zoom: 67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830110204509.png" alt="image-20220830110204509" style="zoom: 60%;" />

#### Fresnel Reflection / Term

菲涅尔项表示反射情况与入射角度有关

绝缘体：

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830110737661.png" alt="image-20220830110737661" style="zoom:67%;" />

导体：

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830110929859.png" alt="image-20220830110929859" style="zoom:67%;" />

精确算法：需要考虑极化现象

![image-20220830111111189](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830111111189.png)

近似算法： Schlick’s approximation

即无论什么材质，都假设 reflect 是条根据角度从低到高，不断增大的曲线，从而拟合菲涅尔项

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830111126508.png" alt="image-20220830111126508" style="zoom:80%;" />

#### Microfacet Material（微面材料）

宏观上：平坦 & 粗糙

微观上：崎岖 & 光滑

每个微面具有各自的法线，法线的分布可划分材质：

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830120609311.png" alt="image-20220830120609311" style="zoom:80%;" />

#### Microfacet BRDF

为方便计算有多少入射能反射到出射，比较半程向量与法线之间关系

F 为菲涅尔项

G 为几何项，用于修正结果：由于各个微面之间可能存在遮挡，当遇到Grazing Angle（掠射角度）的光线，则会造成遮挡

D 为法线分布情况

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830120732753.png" alt="image-20220830120732753" style="zoom:80%;" />

#### Isotropic / Anisotropic Materials (BRDFs)

各向同性：微表面的法线方向性很弱

各向异性：法线分布具有明确方向性

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830120906677.png" alt="image-20220830120906677" style="zoom:80%;" />

##### Anisotropic BRDFs

入射与反射角不变，在方位角上旋转，结果不一致，则为各向异性

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830143759641.png" alt="image-20220830143759641" style="zoom:80%;" />



### Properties of BRDFs

Non-negativity（非负的）

Linearity：分块运算和整体运算结果一致

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830144228902.png" alt="image-20220830144228902" style="zoom:80%;" />

Reciprocity principle：调换方向BRDF不变

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830144417874.png" alt="image-20220830144417874" style="zoom:80%;" />

Energy conservation（能量守恒）

isotropic 的材质，运算可降维。又因为BRDF变换方向不改变大小，则方位角之间不用考虑相对大小

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830144557578.png" alt="image-20220830144557578" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830144730690.png" alt="image-20220830144730690" style="zoom:80%;" />

### Measuring BRDFs

控制光源和相机，遍历每一种可能的结果

```
foreach outgoing direction wo
  move light to illuminate surface with a thin beam from wo
  for each incoming direction wi
    move sensor to be at direction wi from surface
    measure incident radiance
```



## Advanced Topics in Rendering

### Unbiased light transport methods

#### Bidirectional Path Tracing (BDPT)

分别追踪从光源开始和从摄像机开始的 sub-paths

将两者的 end-points 连接生成路径

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830150608658.png" alt="image-20220830150608658" style="zoom:80%;" />

适用于光源测光照较为复杂时的情况

缺陷：难以实现，速度缓慢

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830150712384.png" alt="image-20220830150712384" style="zoom:80%;" />



#### Metropolis Light Transport (MLT)

应用 Markov Chain（马尔科夫链）

通过马尔科夫链，干扰已有的一条路径，获得其他近似的路径

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830152127260.png" alt="image-20220830152127260" style="zoom:80%;" />

适用于复杂的光线路径

缺陷：

难以估计收敛速度

每个像素之间的收敛速度并不均等

容易形成 dirty 结果

在渲染动画中几乎不使用

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830152226186.png" alt="image-20220830152226186" style="zoom:80%;" />



### biased light transport methods

#### Photon Mapping

在处理**Specular-Diffuse-Specular (SDS)**的路径和生成 **caustics** 表现极佳

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830155851122.png" alt="image-20220830155851122" style="zoom:80%;" />

##### stage 1 —— photon tracing

从光源释放光子并弹射，直到遇到漫反射面停止，并记录漫反射面上的光子数

##### Stage 2 — photon collection (final gathering) 

从相机射出sub-paths，并弹射，直到遇到漫反射面停止

##### Calculation — local density estimation

对于每个着色点，使用KNN算法寻找最近 N 个光子，计算它们的覆盖面面积

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830160134877.png" alt="image-20220830160134877" style="zoom:80%;" />



当 N 取得越小，噪声越大；当 N 取得越大，图片越模糊

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830160327843.png" alt="image-20220830160327843" style="zoom:80%;" />

##### biased light transport method

Local Density estimation：**dN / dA != ΔN / ΔA**。在常规积分上，往往是取一个很小的范围，从而通过积分求总和，但在 Photon Mapping 中，取得面积很大，不满足积分的条件，因此其结果是 biased，表现在结果中就是 blurry

##### Consistent == not blurry with infinite #samples 

biased 的方法其结果又是 Consistent  的。

在 Photon Mapping 中，每个着色点取得是最近 N 个光子，当更多的光子被射到面上时，N 个光子覆盖的面积将变小，随着光子的整体密度不断提高，**ΔA is closer to dA**

因而随着样本数接近无限，其结果将收敛



#### Vertex Connection and Merging

 BDPT 和 Photon Mapping 的结合

利用BDPT后，当两条子路径的结束点刚好在同个面上，此时可利用 Photon Mapping 避免路径的浪费

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830162113076.png" alt="image-20220830162113076" style="zoom: 80%;" />

#### Instant Radiosity (IR)

从光源射出子路径，并将结束点视为 Virtual Point Light (VPL) ，借用 VPLs 来渲染场景

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830162238648.png" alt="image-20220830162238648" style="zoom:80%;" />

优点：快速，在漫反射场景效果好

缺点：在阴影边缘，容易生成高亮部分；难以处理 glossy 材质

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830162547204.png" alt="image-20220830162547204" style="zoom:80%;" />



## Advanced Appearance Modeling

### Non-surface models

#### Participating Media

雾、云等

光源经过 Participating Media 的任意点，都会发生吸收或散射

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830163210071.png" alt="image-20220830163210071" style="zoom:80%;" />

通常使用相位函数来描述光源在任意点的散射角分布

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830163408081.png" alt="image-20220830163408081"  />

#### Hair Appearance

##### Kajiya-Kay Model

将头发视作一个光滑的圆柱体，入射后，一部分散射，另一部分反射

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830165114639.png" alt="image-20220830165114639" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830170800968.png" alt="image-20220830170800968" style="zoom:80%;" />

##### Marschner Model

认为头发是一种类似玻璃的圆柱体

一部分直接反射，一部分进入圆柱体折射，一部分折射入圆柱体，再反射出

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830165135830.png" alt="image-20220830165135830" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830170724743.png" alt="image-20220830170724743" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830170738378.png" alt="image-20220830170738378" style="zoom:80%;" />

##### Fur Appearance — As Human Hair

Marschner Model 并不能应用于动物的毛发上

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830170902556.png" alt="image-20220830170902556" style="zoom:80%;" />

Marschner Model 认为头发由外围的 Cuticle 和 内部的 Cortex 构成

但在真实的 fair 结构中，中心还存在着一个强散射的 Medulla（髓质）

动物毛发的髓质范围要比人类头发的更大

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830170936973.png" alt="image-20220830170936973" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830171206813.png" alt="image-20220830171206813" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830171233259.png" alt="image-20220830171233259" style="zoom:90%;" />



##### Double Cylinder Model（闫神提出的！）

认为 fair 是双柱体结构，光线的散射共分为五部分

**直接反射 R，折射入-折射出 TT，折射入-髓质散射-折射出 TTs，折射入-反射出 TRT，折射入-髓质散射-反射出 TRTs**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830171315550.png" alt="image-20220830171315550" style="zoom:80%;" />

![image-20220830171347594](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830171347594.png)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830181417491.png" alt="image-20220830181417491" style="zoom:80%;" />

#### Granular Material（颗粒材质）

![image-20220830181501579](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830181501579.png)

### Surface models 

#### Translucent Material（半透明材质）

##### Subsurface Scattering

光线会进入 surface 在物体内进行大量散射，再从另一个点射出

**BSSRDF** 是 BRDF 的衍生，某个点的irradiance 可能受别的点的影响

#### ![image-20220830181934420](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830181934420.png)

##### Dipole Approximation

引入两个光源来近似光纤的传播

![image-20220830182125395](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182125395.png)

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182209110.png" alt="image-20220830182209110" style="zoom:80%;" />



#### Cloth（布料）

fiber（纤维）交织生成 ply（股）

ply 交织生成 Yarn（线）

Yarn 进行 woven 或 knitted 生成 cloth

![image-20220830182429168](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182429168.png)

![image-20220830182438725](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182438725.png)

##### Cloth: Render as Surface

根据编织的图案计算BRDF

不足：对于天鹅绒等材质，当作surface来渲染是不行的

![image-20220830182748746](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182748746.png)

##### Cloth: Render as Participating Media

把 cloth 视作体积来渲染

分为十分细小的格子，每个格子根据织物纹理来渲染，类似于渲染云、烟、雾

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830182936718.png" alt="image-20220830182936718" style="zoom:80%;" />

##### Cloth: Render as Actual Fibers

渲染出每一根纤维，类似处理毛发

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183119895.png" alt="image-20220830183119895" style="zoom:80%;" />

#### Detailed Appearance: Motivation

现实中的表面在细节上往往具有划痕，而渲染的结果往往过于完美，显得不真实

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183334368.png" alt="image-20220830183334368" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183351680.png" alt="image-20220830183351680" style="zoom: 77%;" />

##### Recap: Microfacet BRDF

为了模拟真实的微面，需要引入噪声，例如凹凸贴图

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183522215.png" alt="image-20220830183522215" style="zoom: 67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183533692.png" alt="image-20220830183533692" style="zoom: 67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830183715065.png" alt="image-20220830183715065" style="zoom:80%;" />

##### Difficult path sampling problem

微表面难以控制光线能连通照相机和光源

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830185130527.png" alt="image-20220830185130527" style="zoom:67%;" />

##### Solution: BRDF over a pixel

解决办法是用一个像素覆盖一个微表面范围，计算该范围的法线分布来替代原本的分布，并应用于表面模型

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830185213967.png" alt="image-20220830185213967" style="zoom:67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830185403782.png" alt="image-20220830185403782" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830185418030.png" alt="image-20220830185418030" style="zoom:80%;" />

#### Procedural Appearance

程序化生产，随用随取

由于存取一张三位贴图内存量很大，可通过噪声函数，定义没有纹理的细节

![image-20220830191022757](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220830191022757.png)



## Cameras, Lenses and Light Fields

#### 针孔成像和透镜成像

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901155333865.png" alt="image-20220901155333865" style="zoom:80%;" />

### Pinhole Image Formation

针孔成像的任何位置都是锐利的

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901155436882.png" alt="image-20220901155436882" style="zoom:80%;" />

### Field of View (FOV)

同样大小的感知器，在焦距不同的情况下，视场大小也不同，显然焦距越小，视场越大

因此短焦镜头往往能实现广角，长焦镜头能获得更远距离

焦距不变时，感知器越小，视场越小

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901155542647.png" alt="image-20220901155542647" style="zoom:80%;" />

### Exposure

Exposure = time x irradiance

time 由快门速度控制

irradiance 由光圈大小和焦距控制

大光圈，F值越小，此时有大景深

ISO：仅是让 Exposure 乘一个数值，使结果更亮，但也会放大噪声（线性）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901155946145.png" alt="image-20220901155946145" style="zoom: 80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901160157674.png" alt="image-20220901160157674" style="zoom:80%;" />

#### Side Effect of Shutter Speed

由于物理快门打开的过程中，存在一个打开过程（部分打开了，部分仍关着），因而拍摄高速运动的物体会造成扭曲的结果

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901160237313.png" alt="image-20220901160237313"  />

### Thin Lens Approximation

理想中的透镜：没有厚度，所有平行射线经过透镜都聚焦于一点，焦距可任意改变

焦距的倒数 = 物距的倒数 + 像距的倒数

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901160540809.png" alt="image-20220901160540809" style="zoom:80%;" />

#### Computing Circle of Confusion (CoC) Size

若某个面的发出的射线经过透镜能聚焦到感知器上，该面称为Focal Plane

当不在焦平面上的物体通过透镜产生的焦点，会与感知平面存在距离

此时，该像经过焦点后会继续传播，最终形成了一个圆形范围，称为混淆圈，因而产生了模糊现象（景深现象）

混淆圈大小 C 与射线范围 A 成正比

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901160721522.png" alt="image-20220901160721522" style="zoom:80%;" />

### F-Number (a.k.a. F-Stop)

**F-number = 焦距 / 孔的直径**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901161155634.png" alt="image-20220901161155634" style="zoom:67%;" />

### Ray Tracing Ideal Thin Lenses

利用理想透镜进行光线追踪实现虚化效果

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901161335223.png" alt="image-20220901161335223" style="zoom:80%;" />

#### 准备：

首先，选择感知器大小，透镜的焦距和光圈大小

其次，选择目标物体的深度 Zo

随后，通过透镜方程计算像距 Zi

#### 渲染：

**对于每个像素 X ’ ，随机在透镜平面寻找一个样本 X ‘’ ，根据透镜性质，可以找到对应的X ‘’‘， 评估 x’’ -> x’’’ 的radiance**

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901161351885.png" alt="image-20220901161351885" style="zoom:80%;" />

### Circle of Confusion for Depth of Field

景深范围内的物体，生成的 COC 的范围足够小时（例如一个像素大小），此时结果仍是锐利的

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162053604.png" alt="image-20220901162053604" style="zoom: 80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162228022.png" alt="image-20220901162228022" style="zoom:80%;" />



### Light Field / Lumigraph

当在相机前，放一块能重现所有与现实世界相同光线的屏幕时，其产生的结果与观测现实的结果一致，即虚拟现实

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162522446.png" alt="image-20220901162522446" style="zoom: 67%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162528250.png" alt="image-20220901162528250" style="zoom: 67%;" />

#### The Plenoptic Function

由 theta 和 fa 可观测向任何方向

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162731952.png" alt="image-20220901162731952" style="zoom:67%;" />

引入 λ （波长）后，则可观测颜色

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162812594.png" alt="image-20220901162812594" style="zoom:67%;" />

引入时间 t 后，则生成了动态图像，例如 movie

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162901972.png" alt="image-20220901162901972" style="zoom:67%;" />

引入移动坐标后，则可以观测任意位置

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901162915956.png" alt="image-20220901162915956" style="zoom:67%;" />

综上，全光函数通过七个维度实现了现实世界的观测模式



#### Ray

通过旋转角、方位角、以及坐标XYZ可表示一条射线

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901163137727.png" alt="image-20220901163137727" style="zoom:67%;" />

但我们也能通过两点确定一条直线的方式，来简化一个维度

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901163209568.png" alt="image-20220901163209568" style="zoom:67%;" />

二维方向指通过旋转角和方位角，二维位置指任何三位物体的表面都是二维的，可用uv表示

![image-20220901163742527](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901163742527.png)

#### Synthesizing novel views

由于光场已被记录，那么从任一点的相机观测物体，都可直接读取各个方向的数值，因而可以从光场中获取任意角度观测物体的结果

结合最初的结论，只要记录了光场，则光场后是实际物体，还是一块屏幕，都不影响观测结果，因此可以简化存储形式

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901163956353.png" alt="image-20220901163956353" style="zoom: 50%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901164020181.png" alt="image-20220901164020181" style="zoom: 50%;" />

再结合上述两点可确定一条直线的平面，使用两个平行平面，其上任意两点的连线即可记录一个方向的光场

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901164455200.png" alt="image-20220901164455200" style="zoom:67%;" />

若从uv 的某点，观测 st 平面，就类似于 st 是块屏幕，上面存储着真实世界的光场，则随着 uv 上点位置的不同，可等价获得观测真实世界不同角度的结果

若从 st 的某点，观测 uv 平面，则类似于观测一个像素所获取的 irradiance 中的某个 radiance 的结果，即光场相机的原理

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901164659728.png" alt="image-20220901164659728" style="zoom:80%;" />

#### InWegral Imaging (“Fly's Eye” LensleWs)

原本放置感知器的位置，改为一个透镜，感知器放到透镜之后，从而使每个感知器记录的是 radiance 而不是 irradiance

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901165305507.png" alt="image-20220901165305507" style="zoom:80%;" />

#### The Lytro Light Field Camera

优点：记录的是光场信息，因而可通过后期的光场处理，生成不同效果的照片

缺点：往往分辨率不足，因为需要大量的感知器

![image-20220901165427178](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901165427178.png)



## Physical Basis of Color

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901165737844.png" alt="image-20220901165737844"  />

### Spectral Power Distribution (SPD)

用于描述不同波长的光的分布

![image-20220901170011813](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901170011813.png)

### Biological Basis of Color

颜色是人类的一种感受

人的视网膜上有杆状细胞和锥状细胞

前者区分光暗，后者区分颜色

而锥状细胞区又可分为 S M L 三种，对应于短、中、长波长的峰值响应

眼球将SML三个值传递给大脑，生成颜色的感觉

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901175108677.png" alt="image-20220901175108677" style="zoom:80%;" />

![image-20220901175142492](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901175142492.png)

### Metamerism（同色异谱）

调和不同的光谱，也能生成相同的颜色，因而可以用于实现 Color Matching	

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901175521513.png" alt="image-20220901175521513" style="zoom:80%;" />

#### Color Reproduction / Matching	

##### CIE RGB Color Matching Functions 

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901175735559.png" alt="image-20220901175735559" style="zoom:67%;" />

### Color Spaces

#### Standardized RGB (sRGB) 

sRGB 是广泛应用的标准

其他颜色设备都以此标准来校准监视器

#### A Universal Color Space: CIE XYZ

XYZ 是标准原色，其中 Y 即绿色，代表亮度

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901175958527.png" alt="image-20220901175958527" style="zoom:80%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180037707.png" alt="image-20220901180037707" style="zoom:80%;" />

#### Gamut（色域）

色域是由一组颜色原函数生成的色度集

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180141612.png" alt="image-20220901180141612" style="zoom:80%;" />



### Perceptually Organized Color Spaces

#### HSV Color Space (Hue-Saturation-Value)

Hue（色调）

Saturation（饱和度）

Value（亮度）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180257594.png" alt="image-20220901180257594" style="zoom:80%;" />

#### CIELAB Space (AKA L* a* b*)

L 代表亮度

a *和b * 代表颜色对，端头是互补色

![image-20220901180407089](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180407089.png)

#### CMYK: A Subtractive Color Space

印刷上的原色，K 黑色的存在是为了节省成本

![image-20220901180520049](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180520049.png)

## Animation

### Keyframe Animation

![image-20220901180622445](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180622445.png)

### Physical Simulation

用数值模拟动画过程

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180709033.png" style="zoom: 50%;" />

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180745467.png" alt="image-20220901180745467" style="zoom:67%;" />



### Mass Spring System

#### Idealized spring 

强度与位移成正比（Hooke’s Law 胡克定律）

ks 是一个弹簧系数：刚度

问题：弹簧长度为0

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901180834579.png" alt="image-20220901180834579" style="zoom:67%;" />

#### Non-Zero Length Spring

计算上考虑了弹簧长度

问题：缺乏阻尼力，弹簧将永远运动

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181020353.png" alt="image-20220901181020353" style="zoom:67%;" />

#### Dot Notation for Derivatives

导数的物理表达方式

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181228075.png" alt="image-20220901181228075" style="zoom: 80%;" />

#### Internal Damping for Spring

引入阻尼力

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181317021.png" alt="image-20220901181317021" style="zoom:80%;" />

#### Structures from Springs

最初的结构斜角上不抗剪力，因而加入斜对角线稳固，而竖向也不抗剪力，因而又隔一个连接

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181611014.png" alt="image-20220901181611014" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181620832.png" alt="image-20220901181620832" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181629332.png" alt="image-20220901181629332" style="zoom:67%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901181656419.png" alt="image-20220901181656419" style="zoom:67%;" />



### Particle Systems

将动力学系统的模型定义为大量粒子的集合

每个粒子的运动都是由一组物理（或非物理）力来定义的

每帧的步骤：

创建粒子 -》计算每个粒子的受力 -》更新例子的位置和速度 -》移除 dead 粒子 -》渲染粒子

![](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182143506.png)

#### Single Particle Simulation

假设粒子由一个位置和时间函数确定的速度 v（x，t）进行驱动

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902093909163.png" alt="image-20220902093909163" style="zoom: 67%;" />

##### Ordinary Differential Equation (ODE)

该函数是一个常微分方程

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094114112.png" alt="image-20220902094114112" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094135330.png" alt="image-20220902094135330" style="zoom:67%;" />

##### Euler’s Method

欧拉法就是算出每个时间点的下一速度和下一加速度，进行不断更新

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094226982.png" alt="image-20220902094226982" style="zoom:67%;" />

缺点：unstable，inaccurate，随着 Δ t 的取值不同，粒子的路径会有很大差异，从而导致误差积累，最终使模拟发散

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094402763.png" alt="image-20220902094402763" style="zoom:67%;" />						<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094502639.png" alt="image-20220902094502639" style="zoom:67%;" />

#### Combating Instability

##### Midpoint Method

1. 计算欧拉步距（a）
2. 计算中点的欧拉步距（b）
3. 使用中点的步距来更新位置（c）

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094739024.png" alt="image-20220902094739024" style="zoom:80%;" /><img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902094749616.png" alt="image-20220902094749616" style="zoom:67%;" />

##### Modified Euler

使用起始点和终点的平均速度来更新粒子位置

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902095045012.png" alt="image-20220902095045012" style="zoom:80%;" />

##### Adaptive Step Size

自适应步长首先计算 Δt 更新后的位置，再计算 Δt / 2 更新后的位置，若两者的差距较大，则进一步使用更小的时间计算新的位置，直到误差小于thread时停止

![image-20220902095131734](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902095131734.png)![image-20220902095141653](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902095141653.png)

##### Implicit Euler Method

隐式欧拉法使用了未来的导数来更新现有的值

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220902095507826.png" alt="image-20220902095507826" style="zoom:80%;" />

#### How to determine “stability”? 

#### Fluid Simulation

假设水体是由微小的刚体球组成，假设水不可被压缩

因此每当某个位置的密度发生改变，就需要通过改变粒子的位置来校准

需要获知任何位置中的每个粒子的密度梯度

使用梯度下降更新

### Forward Kinematics 

铰接式骨架：

拓朴结构控制怎么连接，接点的几何关系，树形结构

**Pin（1D 旋转）Ball（2D 旋转）棱柱形关节（变换）**

![image-20220901182323896](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182323896.png)![image-20220901182346569](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182346569.png)									<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182458848.png" alt="image-20220901182458848" style="zoom: 33%;" />

缺陷：不同的动作组合，可能结果一致，难以计算；对于动画创作来说，控制公式比较费时，不直观

### Rigging

例如贝塞尔曲线，控制模型的控制点

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182817793.png" alt="image-20220901182817793" style="zoom: 80%;" />

#### Motion Capture

记录真实世界的表现，并从收集的数据中提取动作

优点：快速获取大量真实数据，真实性高

缺陷：昂贵；收集的数据不满足艺术需要的需要处理

![image-20220901182952109](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901182952109.png)

#### The Production pipeline

![image-20220901183139495](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220901183139495.png)
