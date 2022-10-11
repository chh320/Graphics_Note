# [Learn OpenGL](https://learnopengl.com/Introduction)

## Getting started

### Hello Window

glad 的头函数需要写在 glfw 之前

glfwWindowHint 的第一个参数代表选项，第二个代表这个选项的值，所有选项对应的值都可在 [GLFW’s window handling](http://www.glfw.org/docs/latest/window.html#window_hints) 这篇文档中找到

GLAD 用于管理 OpenGL 的函数指针，因而调用 OpenGL 的函数前，需要初始化 GLAD

glViewport 用于进行 2D 坐标的转换

#### 双缓冲(Double Buffer)

前缓冲保存最终输出的图像，并显示在屏幕上；后缓冲处理渲染指令，并进行绘制

渲染指令执行完毕后，Swap 前后缓冲，从而避免渲染过程中的图像闪烁

#### glClear

可能的缓冲位有**GL_COLOR_BUFFER_BIT，GL_DEPTH_BUFFER_BIT 和 GL_STENCIL_BUFFER_BIT**

glClearColor（）可设置颜色

```cpp
#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <iostream>

void framebuffer_size_callback(GLFWwindow* window, int width, int height);
void processInput(GLFWwindow* window);

const unsigned int SCR_WIDTH = 800;
const unsigned int SCR_HEIGHT = 600;

int main()
{
	// 初始化GLFW配置
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);	// 设置主版本号
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);	// 设置次版本号
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);	// 使用核心模式

#ifdef __APPLE__
	glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

	// 创建GLFW窗口
	GLFWwindow* window = glfwCreateWindow(800, 600, "LearnOpenGL", NULL, NULL);
	if (window == NULL)
	{
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}
	glfwMakeContextCurrent(window);	// 将窗口上下文设置为当前线程的上下文
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback); 	// 每当窗口大小，调用回调函数

	// 调用OpenGL函数前，初始化GLAD
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress))
	{
		std::cout << "Failed to initialize GLAD" << std::endl;
		return -1;
	}

	// render loop
	while (!glfwWindowShouldClose(window))	// 每次循环前检查GLFW是否要退出
	{
		// 输入
		processInput(window);		// 判断ESC键是否被按下

		// 渲染
		glad_glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
		glClear(GL_COLOR_BUFFER_BIT);

		glfwPollEvents();			// 检查触发的事件，并调用对应的回调函数
		glfwSwapBuffers(window);	// 交换颜色缓冲，用作绘制
	}

	// 结束GLFW，释放资源
	glfwTerminate();
	return 0;
}

void framebuffer_size_callback(GLFWwindow* window, int width, int height)	//回调函数
{
	glViewport(0, 0, width, height);		// 前两个控制窗口左下角位置
}

void processInput(GLFWwindow* window)
{
	if (glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
		glfwSetWindowShouldClose(window, true);
}
```

### Hello Triangle

- 顶点数组对象：Vertex Array Object，VAO
- 顶点缓冲对象：Vertex Buffer Object，VBO
- 元素缓冲对象：Element Buffer Object，EBO 或 索引缓冲对象 Index Buffer Object，IBO

3D 坐标转为 2D 坐标的处理过程是由 OpenGL 的图形渲染管线管理的

#### 图形渲染管线步骤：

1. 把你的 3D 坐标转换为 2D 坐标

2. 是把 2D 坐标转变为实际的有颜色的像素

PS：2D 坐标和像素是不同的，2D 坐标精确表示一个点在 2D 空间中的位置，而 2D 像素是这个点的近似值，2D 像素受到你的屏幕/窗口分辨率的限制。

![image-20220906100948691](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220906100948691.png)

##### 1. 我们以数组的形式传递 3 个 3D 坐标作为图形渲染管线的输入，用来表示一个三角形，这个数组叫做**顶点数据(Vertex Data)**

顶点数据是一系列顶点的集合。一个顶点(Vertex)是一个 3D 坐标的数据的集合。而顶点数据是用顶点属性(Vertex Attribute)表示的，它可以包含任何我们想用的数据

同时，OpenGL 需要你去指定这些数据所表示的渲染类型。

我们是希望把这些数据渲染成一系列的点？一系列的三角形？还是仅仅是一个长长的线？做出的这些提示叫做图元(Primitive)，任何一个绘制指令的调用都将把图元传递给 OpenGL。

其中的几个：**GL_POINTS、GL_TRIANGLES、GL_LINE_STRIP**

##### 2. 图形渲染管线的第一个部分是**顶点着色器(Vertex Shader)**，它把一个单独的顶点作为输入。

顶点着色器主要的目的是把 3D 坐标转为另一种 3D 坐标，同时顶点着色器允许我们对顶点属性进行一些基本处理。

##### 3. **图元装配(Primitive Assembly)**阶段将顶点着色器输出的所有顶点作为输入（如果是 GL_POINTS，那么就是一个顶点），并所有的点装配成指定图元的形状

本节例子中是一个三角形。

##### 4. 图元装配阶段的输出会传递给**几何着色器(Geometry Shader)**。

几何着色器把图元形式的一系列顶点的集合作为输入，它可以通过产生新顶点构造出新的（或是其它的）图元来生成其他形状。例子中，它生成了另一个三角形

##### 5. 几何着色器的输出会被传入**光栅化阶段(Rasterization Stage)**

这里它会把图元映射为最终屏幕上相应的像素，生成供片段着色器(Fragment Shader)使用的片段(Fragment)。在片段着色器运行之前会执行裁切(Clipping)。裁切会丢弃超出你的视图以外的所有像素，用来提升执行效率。

OpenGL 中的一个片段是 OpenGL 渲染一个像素所需的所有数据。

##### 6. 片段着色器的主要目的是计算一个像素的最终颜色，这也是所有 OpenGL 高级效果产生的地方。

通常，片段着色器包含 3D 场景的数据（比如光照、阴影、光的颜色等等），这些数据可以被用来计算最终像素的颜色。

##### 7. 在所有对应颜色值确定以后，最终的对象将会被传到最后一个阶段，我们叫做 Alpha 测试和混合(Blending)阶段。

这个阶段检测片段的对应的深度（和模板(Stencil)）值，用它们来判断这个像素是其它物体的前面还是后面，决定是否应该丢弃。

这个阶段也会检查 alpha 值（alpha 值定义了一个物体的透明度）并对物体进行混合(Blend)。

所以，即使在片段着色器中计算出来了一个像素输出的颜色，在渲染多个三角形的时候最后的像素颜色也可能完全不同。

##### 对于大多数场合，我们只需要配置顶点和片段着色器，几何着色器通常选择默认

#### 顶点输入

OpenGL 仅当 3D 坐标在 3 个轴（x、y 和 z）上-1.0 到 1.0 的范围内时才处理它

所有在这个范围内的坐标叫做**标准化设备坐标(Normalized Device Coordinates)**，此范围内的坐标最终显示在屏幕上（在这个范围以外的坐标则不会显示）。

![image-20220906144014984](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220906144014984.png)

通过顶点缓冲对象(Vertex Buffer Objects, VBO)管理顶点着色器处理顶点所使用的内存

由于 CPU 向 GPU 发送数据较为缓慢，因而通过缓存一次性发送大批数据能加快过程

VBO 使用的步骤：

1. 通过 glGenBuffers()构建一个 VBO 缓存
2. glBindBuffer(GL_ARRAY_BUFFER, VBO) 绑定缓存
3. glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW)复制数据到缓存

其中，缓存内数据的管理类型可分为：

- GL_STATIC_DRAW ：数据不会或几乎不会改变。
- GL_DYNAMIC_DRAW：数据会被改变很多。
- GL_STREAM_DRAW ：数据每次绘制时都会改变

#### 链接顶点属性

![image-20220906145019508](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220906145019508.png)

- 位置数据被储存为 32 位（4 字节）浮点值。
- 每个位置包含 3 个这样的值。
- 在这 3 个值之间没有空隙（或其他值）。这几个值在数组中紧密排列(Tightly Packed)。
- 数据中第一个值在缓冲开始的位置。

##### 使用 glVertexAttribPointer(0, 3, GL*FLOAT, GL_FALSE, 3 * sizeof(float), (void\_)0) 告诉 OpenGL 顶点数据解析方式

第一个参数：顶点属性位置

第二个参数：顶点属性大小

第三个参数：数据类型

第四个参数：是否将数据标准化

第五个参数：步长（stride）

第六个参数：偏移量（Offset），空指针类型

##### glEnableVertexAttribArray（）启用顶点属性，参数为顶点位置值

```cpp
// 0. 复制顶点数组到缓冲中供OpenGL使用
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 1. 设置顶点属性指针
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// 2. 当我们渲染一个物体时要使用着色器程序
glUseProgram(shaderProgram);
// 3. 绘制物体
someOpenGLFunctionThatDrawsOurTriangle();
```

#### 顶点数组对象(Vertex Array Object, VAO)

![image-20220906145525854](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220906145525854.png)

```cpp
// ..:: 初始化代码（只运行一次 (除非你的物体频繁改变)） :: ..
// 1. 绑定VAO
glBindVertexArray(VAO);
// 2. 把顶点数组复制到缓冲中供OpenGL使用
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. 设置顶点属性指针
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

[...]

// ..:: 绘制代码（渲染循环中） :: ..
// 4. 绘制物体
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
someOpenGLFunctionThatDrawsOurTriangle();
```

#### 元素缓冲对象(Element Buffer Object，EBO)

![image-20220906150101345](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220906150101345.png)

为了避免多边形划分后的三角面所重合的点被重复绘制，引入 EBO

分为顶点表和索引表，即所谓的索引绘制

```cpp
// ..:: 初始化代码 :: ..
// 1. 绑定顶点数组对象
glBindVertexArray(VAO);
// 2. 把我们的顶点数组复制到一个顶点缓冲中，供OpenGL使用
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
// 3. 复制我们的索引数组到一个索引缓冲中，供OpenGL使用
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
// 4. 设定顶点属性指针
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

[...]

// ..:: 绘制代码（渲染循环中） :: ..
glUseProgram(shaderProgram);
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
glBindVertexArray(0);
```

#### 顶点着色器

```cpp
const char *vertexShaderSource = "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "void main()\n"
    "{\n"
    "   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";
unsigned int vertexShader = glCreateShader(GL_VERTEX_SHADER);
glShaderSource(vertexShader, 1, &vertexShaderSource, NULL);
glCompileShader(vertexShader);

int  success;
char infoLog[512];
glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
if(!success)
{
    glGetShaderInfoLog(vertexShader, 512, NULL, infoLog);
    std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
}
```

#### 片段着色器

```cpp
const char* vertexShaderSource = "#version 330 core\n"
	"layout (location = 0) in vec3 aPos;\n"
	"void main()\n"
	"{\n"
	"	gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
	"}\0";
unsigned int fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
glShaderSource(fragmentShader, 1, &fragmentShaderSource, NULL);
glCompileShader(fragmentShader);
```

#### 着色器程序

```cpp
unsigned int shaderProgram = glCreateProgram();
glAttachShader(shaderProgram, vertexShader);
glAttachShader(shaderProgram, fragmentShader);
glLinkProgram(shaderProgram);

glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
if (!success)
{
	glGetProgramInfoLog(shaderProgram, 512, NULL, infoLog);
	std::cout << "ERROR::SHADER::PROGRAM::LINK_FAILED\n" << infoLog << std::endl;
}
glUseProgram(shaderProgram);
glDeleteShader(vertexShader);
glDeleteShader(fragmentShader);
```

### Shader

#### GLSL

着色器是使用一种叫 GLSL 的类 C 语言写成的

着色器的开头总是要声明版本，接着是输入和输出变量、uniform 和 main 函数

```cpp
#version version_number
in type in_variable_name;
in type in_variable_name;

out type out_variable_name;

uniform type uniform_name;

int main()
{
  // 处理输入并进行一些图形操作
  ...
  // 输出处理过的结果到输出变量
  out_variable_name = weird_stuff_we_processed;
}
```

可声明的顶点属性是有上限的，它一般由硬件来决定。可以查询 GL_MAX_VERTEX_ATTRIBS 来获取具体的上限

```cpp
int nrAttributes;
glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, &nrAttributes);
std::cout << "Maximum nr of vertex attributes supported: " << nrAttributes << std::endl;
```

GLSL 中的向量是一个可以包含有 2、3 或者 4 个分量的容器

| 类型    | 含义                              |
| :------ | :-------------------------------- |
| `vecn`  | 包含`n`个 float 分量的默认向量    |
| `bvecn` | 包含`n`个 bool 分量的向量         |
| `ivecn` | 包含`n`个 int 分量的向量          |
| `uvecn` | 包含`n`个 unsigned int 分量的向量 |
| `dvecn` | 包含`n`个 double 分量的向量       |

##### 重组

```cpp
vec2 someVec;
vec4 differentVec = someVec.xyxx;
vec3 anotherVec = differentVec.zyw;
vec4 otherVec = someVec.xxxx + anotherVec.yxzy;
```

```cpp
vec2 vect = vec2(0.5, 0.7);
vec4 result = vec4(vect, 0.0, 0.0);
vec4 otherResult = vec4(result.xyz, 1.0);
```

#### 输入与输出

GLSL 定义了`in`和`out`关键字专门来实现这个目的

每个着色器使用这两个关键字设定输入和输出，只要一个输出变量与下一个着色器阶段的输入匹配，它就会传递下去

顶点着色器需要为它的输入提供一个额外的`layout`标识，或通过在 OpenGL 代码中使用 glGetAttribLocation 查询属性位置值(Location)，

片段着色器需要一个`vec4`颜色输出变量，因为片段着色器需要生成一个最终输出的颜色。

```cpp
// 顶点着色器
#version 330 core
layout (location = 0) in vec3 aPos; // 位置变量的属性位置值为0

out vec4 vertexColor; // 为片段着色器指定一个颜色输出

void main()
{
    gl_Position = vec4(aPos, 1.0); // 注意我们如何把一个vec3作为vec4的构造器的参数
    vertexColor = vec4(0.5, 0.0, 0.0, 1.0); // 把输出变量设置为暗红色
}
//片段着色器
#version 330 core
out vec4 FragColor;

in vec4 vertexColor; // 从顶点着色器传来的输入变量（名称相同、类型相同）

void main()
{
    FragColor = vertexColor;
}
```

#### Uniform

uniform 是全局的

uniform 会一直保存数据，直到它被重置或更新

如果你声明了一个 uniform 却在 GLSL 代码中没用过，编译器会静默移除这个变量，导致最后编译出的版本中并不会包含它

```cpp
#version 330 core
out vec4 FragColor;

uniform vec4 ourColor; // 在OpenGL程序代码中设定这个变量

void main()
{
    FragColor = ourColor;
}
```

更新一个 uniform 之前**必须**先使用程序（调用 glUseProgram)，因为它是在当前激活的着色器程序中设置 uniform 的

```cpp
float timeValue = glfwGetTime();
float greenValue = (sin(timeValue) / 2.0f) + 0.5f;
int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
glUseProgram(shaderProgram);
glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
```

glUniform 的后缀

| `f`  | 函数需要一个 float 作为它的值          |
| ---- | -------------------------------------- |
| `i`  | 函数需要一个 int 作为它的值            |
| `ui` | 函数需要一个 unsigned int 作为它的值   |
| `3f` | 函数需要 3 个 float 作为它的值         |
| `fv` | 函数需要一个 float 向量/数组作为它的值 |

### Transformations

#### 向量与标量运算

在数学上不存在向量与标量的加法，但很多线性代数库都支持，例如 numpy 的广播（矩阵与标量运算同样）

![image-20220908150932950](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220908150932950.png)

![image-20220908151050041](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220908151050041.png)![image-20220908151056489](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220908151056489.png)

### Coordinate Systems

- 局部空间(Local Space，或者称为物体空间(Object Space))
- 世界空间(World Space)
- 观察空间(View Space，或者称为视觉空间(Eye Space))
- 裁剪空间(Clip Space)
- 屏幕空间(Screen Space)

模型(Model)、观察(View)、投影(Projection)三个矩阵

![image-20220912131503969](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220912131503969.png)

1. 局部坐标是对象相对于局部原点的坐标，也是物体起始的坐标。
2. 下一步是将局部坐标变换为世界空间坐标，世界空间坐标是处于一个更大的空间范围的。这些坐标相对于世界的全局原点，它们会和其它物体一起相对于世界的原点进行摆放。
3. 接下来我们将世界坐标变换为观察空间坐标，使得每个坐标都是从摄像机或者说观察者的角度进行观察的。
4. 坐标到达观察空间之后，我们需要将其投影到裁剪坐标。裁剪坐标会被处理至-1.0 到 1.0 的范围内，并判断哪些顶点将会出现在屏幕上。
5. 最后，我们将裁剪坐标变换为屏幕坐标，我们将使用一个叫做视口变换(Viewport Transform)的过程。视口变换将位于-1.0 到 1.0 范围的坐标变换到由 glViewport 函数所定义的坐标范围内。最后变换出来的坐标将会送到光栅器，将其转化为片段。

#### 局部空间

局部空间是指物体所在的坐标空间，即对象最开始所在的地方

#### 世界空间

是指顶点相对于（游戏）世界的坐标

#### 观察空间

观察空间就是从摄像机的视角所观察到的空间

世界空间通过观察矩阵的变换，成为观察空间

#### 裁剪空间

由投影矩阵创建的**观察箱**(Viewing Box)被称为平截头体(Frustum)，每个出现在平截头体范围内的坐标都会最终出现在用户的屏幕上。

将特定范围内的坐标转化到标准化设备坐标系的过程（而且它很容易被映射到 2D 观察空间坐标）被称之为投影(Projection)

##### 正射投影

正射投影矩阵定义了一个类似立方体的平截头箱，它定义了一个裁剪空间，在这空间之外的顶点都会被裁剪掉

创建一个正射投影矩阵需要指定可见平截头体的宽、高和长度

![image-20220912132839002](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220912132839002.png)

创建 Orthographic Projection Matrix

```cpp
glm::ortho(0.0f, 800.0f, 0.0f, 600.0f, 0.1f, 100.0f);
```

一二参数：左右坐标

三四参数：底部和顶部

五六参数：near 和 far

##### 透视投影

$$
out = \begin{pmatrix} x /w \\ y / w \\ z / w \end{pmatrix}
$$

顶点坐标的每个分量都会除以它的 w 分量，距离观察者越远顶点坐标就会越小

创建 Perspective Projection Matrix

```cpp
glm::perspective(glm::radians(45.0f), (float)width/(float)height, 0.1f, 100.0f);
```

第一个参数定义了 fov 的值，它表示的是视野(Field of View)

第二个参数设置了宽高比，由视口的宽除以高所得

第三和第四个参数设置了平截头体的**近**和**远**平面

![image-20220912133528344](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220912133528344.png)

#### [组合后](http://www.songho.ca/opengl/gl_projectionmatrix.html)

$$
V_{clip} = M_{projection} \cdot M_{view} \cdot M_{model} \cdot V_{local}
$$

最后的顶点应该被赋值到顶点着色器中的 gl_Position

随后，OpenGL 对**裁剪坐标**执行**透视除法**从而将它们变换到**标准化设备坐标**

OpenGL 会使用 glViewPort 内部的参数来将标准化设备坐标映射到**屏幕坐标**，每个坐标都关联了一个屏幕上的点，这个过程称为视口变换

#### 进入 3D

首先创建一个模型矩阵（M）

这个模型矩阵包含了位移、缩放与旋转操作，它们会被应用到所有物体的顶点上，以变换它们到全局的世界空间

```cpp
glm::mat4 model;
model = glm::rotate(model, glm::radians(-55.0f), glm::vec3(1.0f, 0.0f, 0.0f));
```

观察矩阵（V）

```cpp
glm::mat4 view;
// 注意，我们将矩阵向我们要进行移动场景的反方向移动。
view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
```

投影矩阵（P）

```cpp
glm::mat4 projection;
projection = glm::perspective(glm::radians(45.0f), screenWidth / screenHeight, 0.1f, 100.0f);
```

顶点着色器

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
...
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    // 注意乘法要从右向左读
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    ...
}
```

```cpp
int modelLoc = glGetUniformLocation(ourShader.ID, "model"));
glUniformMatrix4fv(modelLoc, 1, GL_FALSE, glm::value_ptr(model));
... // 观察矩阵和投影矩阵与之类似
```

#### Z 缓冲

深度值存储在每个片段里面（作为片段的**z**值），当片段想要输出它的颜色时，OpenGL 会将它的深度值和 z 缓冲进行比较，如果当前的片段在其它片段之后，它将会被丢弃，否则将会覆盖

这个过程称为深度测试(Depth Testing)，它是由 OpenGL 自动完成的。

```cpp
glEnable(GL_DEPTH_TEST);
// 渲染循环中需要清楚深度缓冲
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```

### Camera

#### 摄像机/观察空间

当我们讨论摄像机/观察空间(Camera/View Space)的时候，是在讨论以摄像机的视角作为场景原点时场景中所有的顶点坐标：观察矩阵把所有的世界坐标变换为相对于摄像机位置与方向的观察坐标

摄像机朝向 -Z 方向，当希望摄像机向后移动时，即向 Z 轴正向移动

![image-20220912195909689](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220912195909689.png)

确定步骤：

1. 摄像机位置

   世界空间中一个指向摄像机位置的向量

```cpp
glm::vec3 cameraPos = glm::vec3(0.0f, 0.0f, 3.0f);
```

2. 摄像机方向（方向向量）

​ 原点指向摄像机的 Z 轴正向

```cpp
glm::vec3 cameraTarget = glm::vec3(0.0f, 0.0f, 0.0f);
glm::vec3 cameraDirection = glm::normalize(cameraPos - cameraTarget);
```

3. 右轴

   先定义一个上向量（Up Vector），再与方向向量叉乘获得右轴方向（X 轴）

```cpp
glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f);
glm::vec3 cameraRight = glm::normalize(glm::cross(up, cameraDirection));
```

4. 上轴

​ 根据 x 轴与 z 轴，叉乘获得 y 轴方向：方向向量和右向量进行叉乘

```cpp
glm::vec3 cameraUp = glm::cross(cameraDirection, cameraRight);
```

#### Look At

用 3 个相互垂直的轴外加一个平移向量来创建一个矩阵

可以用这个矩阵乘以任何向量来将其变换到目标坐标空间

$$
LookAt = \begin{bmatrix} \color{red}{R_x} & \color{red}{R_y} & \color{red}{R_z} & 0 \\ \color{green}{U_x} & \color{green}{U_y} & \color{green}{U_z} & 0 \\ \color{blue}{D_x} & \color{blue}{D_y} & \color{blue}{D_z} & 0 \\ 0 & 0 & 0  & 1 \end{bmatrix} * \begin{bmatrix} 1 & 0 & 0 & -\color{purple}{P_x} \\ 0 & 1 & 0 & -\color{purple}{P_y} \\ 0 & 0 & 1 & -\color{purple}{P_z} \\ 0 & 0 & 0  & 1 \end{bmatrix}
$$

其中 R 是右向量，U 是上向量，D 是方向向量，P 是摄像机位置向量

#### 欧拉角

俯仰角(Pitch)、偏航角(Yaw)和滚转角(Roll)

![image-20220913094944141](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220913094944141.png)

对于我们的摄像机系统来说，我们只关心俯仰角和偏航角，所以我们不会讨论滚转角

![image-20220913100237465](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220913100237465.png)![image-20220913100247168](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220913100247168.png)

```cpp
direction.x = cos(glm::radians(pitch)) * cos(glm::radians(yaw)); // 译注：direction代表摄像机的前轴(Front)，这个前轴是和本文第一幅图片的第二个摄像机的方向向量是相反的
direction.y = sin(glm::radians(pitch));
direction.z = cos(glm::radians(pitch)) * sin(glm::radians(yaw));
```

### 小结

- **OpenGL**： 一个定义了函数布局和输出的图形 API 的正式规范。
- **GLAD**： 一个拓展加载库，用来为我们加载并设定所有 OpenGL 函数指针，从而让我们能够使用所有（现代）OpenGL 函数。
- **视口(Viewport)**： 我们需要渲染的窗口。
- **图形管线(Graphics Pipeline)**： 一个顶点在呈现为像素之前经过的全部过程。
- **着色器(Shader)**： 一个运行在显卡上的小型程序。很多阶段的图形管道都可以使用自定义的着色器来代替原有的功能。
- **标准化设备坐标(Normalized Device Coordinates, NDC)**： 顶点在通过在剪裁坐标系中剪裁与透视除法后最终呈现在的坐标系。所有位置在 NDC 下-1.0 到 1.0 的顶点将不会被丢弃并且可见。
- **顶点缓冲对象(Vertex Buffer Object)**： 一个调用显存并存储所有顶点数据供显卡使用的缓冲对象。
- **顶点数组对象(Vertex Array Object)**： 存储缓冲区和顶点属性状态。
- **元素缓冲对象(Element Buffer Object，EBO)，也叫索引缓冲对象(Index Buffer Object，IBO)**： 一个存储元素索引供索引化绘制使用的缓冲对象。
- **Uniform**： 一个特殊类型的 GLSL 变量。它是全局的（在一个着色器程序中每一个着色器都能够访问 uniform 变量），并且只需要被设定一次。
- **纹理(Texture)**： 一种包裹着物体的特殊类型图像，给物体精细的视觉效果。
- **纹理缠绕(Texture Wrapping)**： 定义了一种当纹理顶点超出范围(0, 1)时指定 OpenGL 如何采样纹理的模式。
- **纹理过滤(Texture Filtering)**： 定义了一种当有多种纹素选择时指定 OpenGL 如何采样纹理的模式。这通常在纹理被放大情况下发生。
- **多级渐远纹理(Mipmaps)**： 被存储的材质的一些缩小版本，根据距观察者的距离会使用材质的合适大小。
- **stb_image.h**： 图像加载库。
- **纹理单元(Texture Units)**： 通过绑定纹理到不同纹理单元从而允许多个纹理在同一对象上渲染。
- **向量(Vector)**： 一个定义了在空间中方向和/或位置的数学实体。
- **矩阵(Matrix)**： 一个矩形阵列的数学表达式。
- **GLM**： 一个为 OpenGL 打造的数学库。
- **局部空间(Local Space)**： 一个物体的初始空间。所有的坐标都是相对于物体的原点的。
- **世界空间(World Space)**： 所有的坐标都相对于全局原点。
- **观察空间(View Space)**： 所有的坐标都是从摄像机的视角观察的。
- **裁剪空间(Clip Space)**： 所有的坐标都是从摄像机视角观察的，但是该空间应用了投影。这个空间应该是一个顶点坐标最终的空间，作为顶点着色器的输出。OpenGL 负责处理剩下的事情（裁剪/透视除法）。
- **屏幕空间(Screen Space)**： 所有的坐标都由屏幕视角来观察。坐标的范围是从 0 到屏幕的宽/高。
- **LookAt 矩阵**： 一种特殊类型的观察矩阵，它创建了一个坐标系，其中所有坐标都根据从一个位置正在观察目标的用户旋转或者平移。
- **欧拉角(Euler Angles)**： 被定义为偏航角(Yaw)，俯仰角(Pitch)，和滚转角(Roll)从而允许我们通过这三个值构造任何 3D 方向。

## 光照

### Color

把光源的颜色与物体的颜色值相乘，所得到的就是这个物体所反射的颜色

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220914131937484.png" alt="image-20220914131937484" style="zoom: 67%;" />

### Basic Lighting

#### Phong Lighting Model

- **环境光照(Ambient Lighting)：**即使在黑暗的情况下，世界上通常也仍然有一些光亮（月亮、远处的光），所以物体几乎永远不会是完全黑暗的。为了模拟这个，我们会使用一个环境光照常量，它永远会给物体一些颜色。
- **漫反射光照(Diffuse Lighting)：**模拟光源对物体的方向性影响(Directional Impact)。它是冯氏光照模型中视觉上最显著的分量。物体的某一部分越是正对着光源，它就会越亮。
- **镜面光照(Specular Lighting)：**模拟有光泽物体上面出现的亮点。镜面光照的颜色相比于物体的颜色会更倾向于光的颜色。

![image-20220914132103093](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220914132103093.png)

```cpp
void main()
{
    ...

	vec3 result = (ambient + diffuse + specular) * objectColor;
    FragColor = vec4(result, 1.0);
}
```

##### 环境光照

我们用光的颜色乘以一个很小的常量环境因子，再乘以物体的颜色，然后将最终结果作为片段的颜色

```cpp
float ambientStrength = 0.1;
vec3 ambient = ambientStrength * lightColor;
```

##### 漫反射光照

计算漫反射光照需要什么

- 法向量：一个垂直于顶点表面的向量。
- 定向的光线：作为光源的位置与片段的位置之间向量差的方向向量。为了计算这个光线，我们需要光的位置向量和片段的位置向量

```cpp
vec3 norm = normalize(Normal);
vec3 lightDir = normalize(LightPos - FragPos);
float diff = max(dot(norm, lightDir), 0.0);		// 不需要负值
vec3 diffuse = diff * lightColor;
```

##### 法线矩阵

对于模型的法线也应通过一个矩阵转换到世界坐标中，该矩阵称为法线矩阵

法线矩阵能克服模型进行非等比缩放时，转换后的法线仍然能垂直对应表面

法线矩阵被定义为**「模型矩阵左上角 3x3 部分的逆矩阵的转置矩阵」**

```cpp
Normal = mat3(transpose(inverse(model))) * aNormal;	// 强制转换为3x3矩阵
```

矩阵求逆是一项对于着色器开销很大的运算，因为它必须在场景中的每一个顶点上进行，所以应该尽可能地避免在着色器中进行求逆运算，对于一个高效的应用来说，你最好先在 CPU 上计算出法线矩阵，再通过 uniform 把它传递给着色器

##### 镜面光照

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220914142046400.png" alt="image-20220914142046400" style="zoom:67%;" />

```cpp
float specularStrength = 0.5;
vec3 viewDir = normalize(-FragPos);				// 视口坐标下，相机坐标为0
vec3 reflectDir = reflect(-lightDir, norm); 	// reflect函数要求第一个向量是从光源指向片段位置的向量
float spec = pow(max(dot(reflectDir, viewDir), 0.0), 32);
vec3 specular = specularStrength * spec * lightColor;
```

##### 顶点着色器（视口坐标）

```cpp
void main()
{
    FragPos = vec3(view * model * vec4(aPos, 1.0));
    Normal = mat3(transpose(inverse(view * model))) * aNormal;
    gl_Position = projection * view * model * vec4(FragPos, 1.0);
    LightPos = vec3(view * vec4(lightPos, 1.0));
}
```

##### Gouraud Shading

高洛德着色主要在顶点着色器中完成对所有光照的计算

不足：由于是顶点着色，三角形内部的着色主要是通过顶点间的插值，这会导致相邻三角形的边界特别明显

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220914151025914.png" alt="image-20220914151025914" style="zoom:67%;" />

### Materials

分别为三个光照分量定义一个材质颜色(Material Color)：环境光照(Ambient Lighting)、漫反射光照(Diffuse Lighting)和镜面光照(Specular Lighting)

通过为每个分量指定一个颜色，我们就能够对表面的颜色输出有细粒度的控制了

```cpp
struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material material;
```

[devernay.free.fr](http://devernay.free.fr/cours/opengl/materials.html)中的一个表格展示了一系列材质属性，它们模拟了现实世界中的真实材质

![image-20220914153154465](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220914153154465.png)

```cpp
lightingShader.setVec3("material.ambient",  1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.diffuse",  1.0f, 0.5f, 0.31f);
lightingShader.setVec3("material.specular", 0.5f, 0.5f, 0.5f);
lightingShader.setFloat("material.shininess", 32.0f);
```

##### 光的属性

光源对环境光、漫反射和镜面光分量分别具有不同的强度

```cpp
struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

uniform Light light;

vec3 ambient  = light.ambient * material.ambient;
vec3 diffuse  = light.diffuse * (diff * material.diffuse);
vec3 specular = light.specular * (spec * material.specular);
```

```cpp
lightingShader.setVec3("light.ambient",  0.2f, 0.2f, 0.2f);
lightingShader.setVec3("light.diffuse",  0.5f, 0.5f, 0.5f); // 将光照调暗了一些以搭配场景
lightingShader.setVec3("light.specular", 1.0f, 1.0f, 1.0f);
```

### Lighting maps

#### 漫反射贴图

是一个表现了物体所有的漫反射颜色的纹理图像

在着色器中使用漫反射贴图的方法和纹理教程中是完全一样的

注意`sampler2D`是所谓的不透明类型(Opaque Type)，也就是说我们不能将它实例化，只能通过 uniform 来定义它

#### 镜面光贴图

我们同样可以使用一个专门用于镜面高光的纹理贴图。这也就意味着我们需要生成一个黑白的（如果你想得话也可以是彩色的）纹理，来定义物体每部分的镜面光强度

镜面高光的强度可以通过图像每个像素的亮度来获取

### Light casters

将光**投射**(Cast)到物体的光源叫做投光物(Light Caster)

#### 平行光

当一个光源处于很远的地方时，来自光源的每条光线就会近似于互相平行

定向光对于照亮整个场景的全局光源非常棒

![image-20220915144805995](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220915144805995.png)

```cpp
struct Light {
    // vec3 position; // 使用定向光就不再需要了
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
...
void main()
{
  vec3 lightDir = normalize(-light.direction);
  ...
}
```

注意我们首先对 light.direction 向量取反。我们目前使用的光照计算需求一个从片段**至**光源的光线方向，但人们更习惯定义定向光为一个**从**光源出发的全局方向。所以我们需要对全局光照方向向量取反来改变它的方向，它现在是一个指向光源的方向向量了

**PS：当向量被设为 vec4 时，判断 w 是否为 1，w == 1 表示位置向量，w == 0 表示方向向量**

```cpp
if(lightVector.w == 0.0) // 注意浮点数据类型的误差
  // 执行定向光照计算
else if(lightVector.w == 1.0)
  // 根据光源的位置做光照计算（与上一节一样）
```

#### 点光源

点光源是处于世界中某一个位置的光源，它会朝着所有方向发光，但光线会随着距离逐渐衰减

![image-20220915152407193](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220915152407193.png)

##### 衰减

$$
\begin{equation} F_{att} = \frac{1.0}{K_c + K_l * d + K_q * d^2} \end{equation}
$$

在这里**d**代表了片段距光源的距离

接下来为了计算衰减值，我们定义 3 个（可配置的）项：常数项**Kc**、一次项**Kl**和二次项**Kq**

- 常数项通常保持为 1.0，它的主要作用是保证分母永远不会比 1 小，否则的话在某些距离上它反而会增加强度，这肯定不是我们想要的效果
- 一次项会与距离值相乘，以线性的方式减少强度
- 二次项会与距离的平方相乘，让光源以二次递减的方式减少强度。二次项在距离比较小的时候影响会比一次项小很多，但当距离值比较大的时候它就会比一次项更大了

![image-20220915152751645](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220915152751645.png)

由于二次项的存在，光线会在大部分时候以线性的方式衰退，直到距离变得足够大，让二次项超过一次项，光的强度会以更快的速度下降。这样的结果就是，光在近距离时亮度很高，但随着距离变远亮度迅速降低，最后会以更慢的速度减少亮度

| 距离 | 常数项 | 一次项 | 二次项   |
| :--- | :----- | :----- | :------- |
| 7    | 1.0    | 0.7    | 1.8      |
| 13   | 1.0    | 0.35   | 0.44     |
| 20   | 1.0    | 0.22   | 0.20     |
| 32   | 1.0    | 0.14   | 0.07     |
| 50   | 1.0    | 0.09   | 0.032    |
| 65   | 1.0    | 0.07   | 0.017    |
| 100  | 1.0    | 0.045  | 0.0075   |
| 160  | 1.0    | 0.027  | 0.0028   |
| 200  | 1.0    | 0.022  | 0.0019   |
| 325  | 1.0    | 0.014  | 0.0007   |
| 600  | 1.0    | 0.007  | 0.0002   |
| 3250 | 1.0    | 0.0014 | 0.000007 |

常数项 Kc 在所有的情况下都是 1.0，一次项 Kl 为了覆盖更远的距离通常都很小，二次项 Kq 甚至更小

##### 实现衰减

```cpp
struct Light {
    vec3 position;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float constant;
    float linear;
    float quadratic;
};
```

#### 聚光

聚光是位于环境中某个位置的光源，它只朝一个特定方向而不是所有方向照射光线

这样的结果就是只有在聚光方向的特定半径内的物体才会被照亮，其它的物体都会保持黑暗

OpenGL 中聚光是用一个世界空间位置、一个方向和一个切光角(Cutoff Angle)来表示的，切光角指定了聚光的半径（是圆锥的半径不是距光源距离那个半径）

![image-20220915153734368](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220915153734368.png)

- `LightDir`：从片段指向光源的向量
- `SpotDir`：聚光所指向的方向
- `Phi` **ϕ**：指定了聚光半径的切光角，落在这个角度之外的物体都不会被这个聚光所照亮
- `Theta` **θ**：LightDir 向量和 SpotDir 向量之间的夹角，在聚光内部的话 θ 值应该比 ϕ 值小

**要做的就是计算 LightDir 向量和 SpotDir 向量之间的点积，并将它与切光角 ϕ 值对比，不大于 ϕ 即可被照亮**

```cpp
struct Light {
    vec3  position;
    vec3  direction;
    float cutOff;
    ...
};
```

##### 平滑/软化边缘

为了创建一种看起来边缘平滑的聚光，我们需要模拟聚光有一个内圆锥(Inner Cone)和一个外圆锥(Outer Cone)

如果一个片段处于内外圆锥之间，将会给它计算出一个 0.0 到 1.0 之间的强度值。如果片段在内圆锥之内，它的强度就是 1.0，如果在外圆锥之外强度值就是 0.0。

$$
\begin{equation} I = \frac{\theta - \gamma}{\epsilon} \end{equation}
$$

这里 ϵ(Epsilon)是内（ϕ）和外圆锥（γ）之间的余弦值差

$$
\epsilon =  \phi - \gamma
$$

| θθ    | θθ（角度） | ϕϕ（内光切） | ϕϕ（角度） | γγ（外光切） | γγ（角度） | ϵϵ                      | II                            |
| :---- | :--------- | :----------- | :--------- | :----------- | :--------- | :---------------------- | :---------------------------- |
| 0.87  | 30         | 0.91         | 25         | 0.82         | 35         | 0.91 - 0.82 = 0.09      | 0.87 - 0.82 / 0.09 = 0.56     |
| 0.9   | 26         | 0.91         | 25         | 0.82         | 35         | 0.91 - 0.82 = 0.09      | 0.9 - 0.82 / 0.09 = 0.89      |
| 0.97  | 14         | 0.91         | 25         | 0.82         | 35         | 0.91 - 0.82 = 0.09      | 0.97 - 0.82 / 0.09 = 1.67     |
| 0.83  | 34         | 0.91         | 25         | 0.82         | 35         | 0.91 - 0.82 = 0.09      | 0.83 - 0.82 / 0.09 = 0.11     |
| 0.64  | 50         | 0.91         | 25         | 0.82         | 35         | 0.91 - 0.82 = 0.09      | 0.64 - 0.82 / 0.09 = -2.0     |
| 0.966 | 15         | 0.9978       | 12.5       | 0.953        | 17.5       | 0.9978 - 0.953 = 0.0448 | 0.966 - 0.953 / 0.0448 = 0.29 |

### Multiple lights

为了避免各种光源的计算代码堆积在一起导致难以理解

考虑将代码封装到 GLSL 函数中

```cpp
out vec4 FragColor;

void main()
{
  // 定义一个输出颜色值
  vec3 output;
  // 将定向光的贡献加到输出中
  output += someFunctionToCalculateDirectionalLight();
  // 对所有的点光源也做相同的事情
  for(int i = 0; i < nr_of_point_lights; i++)
    output += someFunctionToCalculatePointLight();
  // 也加上其它的光源（比如聚光）
  output += someFunctionToCalculateSpotLight();

  FragColor = vec4(output, 1.0);
}
```

### 小结

- **颜色向量(Color Vector)**：一个通过红绿蓝(RGB)分量的组合描绘大部分真实颜色的向量。一个物体的颜色实际上是该物体所不能吸收的反射颜色分量。
- **冯氏光照模型(Phong Lighting Model)**：一个通过计算环境光，漫反射，和镜面光分量的值来估计真实光照的模型。
- **环境光照(Ambient Lighting)**：通过给每个没有被光照的物体很小的亮度，使其不是完全黑暗的，从而对全局光照进行估计。
- **漫反射着色(Diffuse Shading)**：一个顶点/片段与光线方向越接近，光照会越强。使用了法向量来计算角度。
- **法向量(Normal Vector)**：一个垂直于平面的单位向量。
- **法线矩阵(Normal Matrix)**：一个 3x3 矩阵，或者说是没有平移的模型（或者模型-观察）矩阵。它也被以某种方式修改（逆转置），从而在应用非统一缩放时，保持法向量朝向正确的方向。否则法向量会在使用非统一缩放时被扭曲。
- **镜面光照(Specular Lighting)**：当观察者视线靠近光源在表面的反射线时会显示的镜面高光。镜面光照是由观察者的方向，光源的方向和设定高光分散量的反光度值三个量共同决定的。
- **冯氏着色(Phong Shading)**：冯氏光照模型应用在片段着色器。
- **Gouraud 着色(Gouraud shading)**：冯氏光照模型应用在顶点着色器上。在使用很少数量的顶点时会产生明显的瑕疵。会得到效率提升但是损失了视觉质量。
- **GLSL 结构体(GLSL struct)**：一个类似于 C 的结构体，用作着色器变量的容器。大部分时间用来管理输入/输出/uniform。
- **材质(Material)**：一个物体反射的环境光，漫反射，镜面光颜色。这些东西设定了物体所拥有的颜色。
- **光照属性(Light(properties))**：一个光的环境光，漫反射，镜面光的强度。可以使用任何颜色值，对每一个冯氏分量(Phong Component)定义光源发出的颜色/强度。
- **漫反射贴图(Diffuse Map)**：一个设定了每个片段中漫反射颜色的纹理图片。
- **镜面光贴图(Specular Map)**：一个设定了每一个片段的镜面光强度/颜色的纹理贴图。仅在物体的特定区域显示镜面高光。
- **定向光(Directional Light)**：只有一个方向的光源。它被建模为不管距离有多长所有光束都是平行而且其方向向量在整个场景中保持不变。
- **点光源(Point Light)**：一个在场景中有位置的，光线逐渐衰减的光源。
- **衰减(Attenuation)**：光随着距离减少强度的过程，通常使用在点光源和聚光下。
- **聚光(Spotlight)**：一个被定义为在某一个方向上的锥形的光源。
- **手电筒(Flashlight)**：一个摆放在观察者视角的聚光。
- **GLSL uniform 数组(GLSL Uniform Array)**：一个 uniform 值数组。它的工作原理和 C 语言数组大致一样，只是不能动态分配内存。

## Model Loading

### Assimp

[Wavefront 的.obj ](http://en.wikipedia.org/wiki/Wavefront_.obj_file)模型格式，只包含了模型数据以及材质信息，像是模型颜色和漫反射/镜面光贴图

以 XML 为基础的 [Collada 文件格式](http://en.wikipedia.org/wiki/COLLADA) 则非常的丰富，包含模型、光照、多种材质、动画数据、摄像机、完整的场景信息等等

#### 模型加载库

一个非常流行的模型导入库是[Assimp](http://assimp.org/)，它是**Open Asset Import Library**（开放的资产导入库）的缩写

Assimp 能够导入很多种不同的模型文件格式（并也能够导出部分的格式），它会将所有的模型数据加载至 Assimp 的通用数据结构中

![image-20220916143404332](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220916143404332.png)

- 和材质和网格(Mesh)一样，所有的场景/模型数据都包含在 Scene 对象中。Scene 对象也包含了场景根节点的引用。
- 场景的 Root node（根节点）可能包含子节点（和其它的节点一样），它会有一系列指向场景对象中 mMeshes 数组中储存的网格数据的索引。Scene 下的 mMeshes 数组储存了真正的 Mesh 对象，节点中的 mMeshes 数组保存的只是场景中网格数组的索引。
- 一个 Mesh 对象本身包含了渲染所需要的所有相关数据，像是顶点位置、法向量、纹理坐标、面(Face)和物体的材质
- 一个网格包含了多个面。Face 代表的是物体的渲染图元(Primitive)（三角形、方形、点）。一个面包含了组成图元的顶点的索引。由于顶点和索引是分开的，使用一个索引缓冲来渲染是非常简单的
- 最后，一个网格也包含了一个 Material 对象，它包含了一些函数能让我们获取物体的材质属性，比如说颜色和纹理贴图（比如漫反射和镜面光贴图）。

所以，我们需要做的第一件事是将一个物体加载到 Scene 对象中，遍历节点，获取对应的 Mesh 对象（我们需要递归搜索每个节点的子节点），并处理每个 Mesh 对象来获取顶点数据、索引以及它的材质属性。

最终的结果是一系列的网格数据，我们会将它们包含在一个`Model`对象中

##### 网格

通常每个模型都由几个子模型/形状组合而成。组合模型的每个单独的形状就叫做一个网格(Mesh)。

比如说有一个人形的角色：通常会将头部、四肢、衣服、武器建模为分开的组件，并将这些网格组合而成的结果表现为最终的模型

一个网格是我们在 OpenGL 中绘制物体所需的最小单位（顶点数据、索引和材质属性）

一个模型（通常）会包括多个网格。

### Mesh

```cpp
struct Vertex {
    glm::vec3 Position;
    glm::vec3 Normal;
    glm::vec2 TexCoords;
};
```

```cpp
struct Texture {
    unsigned int id;
    string type;
};
```

```cpp
class Mesh {
    public:
        /*  网格数据  */
        vector<Vertex> vertices;
        vector<unsigned int> indices;
        vector<Texture> textures;
        /*  函数  */
        Mesh(vector<Vertex> vertices, vector<unsigned int> indices, vector<Texture> textures);
        void Draw(Shader shader);
    private:
        /*  渲染数据  */
        unsigned int VAO, VBO, EBO;
        /*  函数  */
        void setupMesh();
};
```

### Model

```cpp
class Model
{
    public:
        /*  函数   */
        Model(char *path)
        {
            loadModel(path);
        }
        void Draw(Shader shader);
    private:
        /*  模型数据  */
        vector<Mesh> meshes;
        string directory;
        /*  函数   */
        void loadModel(string path);
        void processNode(aiNode *node, const aiScene *scene);
        Mesh processMesh(aiMesh *mesh, const aiScene *scene);
        vector<Texture> loadMaterialTextures(aiMaterial *mat, aiTextureType type,
                                             string typeName);
};
```

```cpp
void Draw(Shader shader)
{
    for(unsigned int i = 0; i < meshes.size(); i++)
        meshes[i].Draw(shader);
}
```

#### 导入 3D 模型到 OpenGL

```cpp
void loadModel(string path)
{
    Assimp::Importer import;
    const aiScene *scene = import.ReadFile(path, aiProcess_Triangulate | aiProcess_FlipUVs);

    if(!scene || scene->mFlags & AI_SCENE_FLAGS_INCOMPLETE || !scene->mRootNode)
    {
        cout << "ERROR::ASSIMP::" << import.GetErrorString() << endl;
        return;
    }
    directory = path.substr(0, path.find_last_of('/'));

    processNode(scene->mRootNode, scene);
}
```

[预处理指令](http://assimp.sourceforge.net/lib_html/postprocess_8h.html)：

- aiProcess_GenNormals：如果模型不包含法向量的话，就为每个顶点创建法线。
- aiProcess_Triangulate：将模型所有的图元形状变换为三角形
- aiProcess_FlipUVs：在处理的时候翻转 y 轴的纹理坐标
- aiProcess_SplitLargeMeshes：将比较大的网格分割成更小的子网格，适用于渲染有最大顶点数限制，只能渲染较小的网格时
- aiProcess_OptimizeMeshes：将多个小网格拼接为一个大的网格，减少绘制调用从而进行优化 888

```cpp
void processNode(aiNode *node, const aiScene *scene)
{
    // 处理节点所有的网格（如果有的话）
    for(unsigned int i = 0; i < node->mNumMeshes; i++)
    {
        aiMesh *mesh = scene->mMeshes[node->mMeshes[i]];
        meshes.push_back(processMesh(mesh, scene));
    }
    // 接下来对它的子节点重复这一过程
    for(unsigned int i = 0; i < node->mNumChildren; i++)
    {
        processNode(node->mChildren[i], scene);
    }
}
```

### 从 Assimp 到网格

```cpp
Mesh processMesh(aiMesh *mesh, const aiScene *scene)
{
    vector<Vertex> vertices;
    vector<unsigned int> indices;
    vector<Texture> textures;

    for(unsigned int i = 0; i < mesh->mNumVertices; i++)
    {
        Vertex vertex;
        // 处理顶点位置、法线和纹理坐标
        ...
        vertices.push_back(vertex);
    }
    // 处理索引
    ...
    // 处理材质
    if(mesh->mMaterialIndex >= 0)
    {
        ...
    }

    return Mesh(vertices, indices, textures);
}
```

处理网格的过程主要有三部分：获取所有的顶点数据，获取它们的网格索引，并获取相关的材质数据

```cpp
// 处理顶点
glm::vec3 vector;
vector.x = mesh->mVertices[i].x;
vector.y = mesh->mVertices[i].y;
vector.z = mesh->mVertices[i].z;
vertex.Position = vector;
```

注意我们为了传输 Assimp 的数据，我们定义了一个`vec3`的临时变量。

使用这样一个临时变量的原因是 Assimp 对向量、矩阵、字符串等都有自己的一套数据类型，它们并不能完美地转换到 GLM 的数据类型中。

```cpp
// 处理法线
vector.x = mesh->mNormals[i].x;
vector.y = mesh->mNormals[i].y;
vector.z = mesh->mNormals[i].z;
vertex.Normal = vector;
```

```cpp
// 处理纹理坐标
if(mesh->mTextureCoords[0]) // 网格是否有纹理坐标？
{
    glm::vec2 vec;
    vec.x = mesh->mTextureCoords[0][i].x;
    vec.y = mesh->mTextureCoords[0][i].y;
    vertex.TexCoords = vec;
}
else
    vertex.TexCoords = glm::vec2(0.0f, 0.0f);
```

#### 索引

Assimp 的接口定义了每个网格都有一个面(Face)数组，每个面代表了一个图元

一个面包含了多个索引，它们定义了在每个图元中，应该绘制哪个顶点，并以什么顺序绘制

所以，遍历所有的面，并储存面的索引到 indices 这个 vector 中即可

```cpp
for(unsigned int i = 0; i < mesh->mNumFaces; i++)
{
    aiFace face = mesh->mFaces[i];
    for(unsigned int j = 0; j < face.mNumIndices; j++)
        indices.push_back(face.mIndices[j]);
}
```

#### 材质

```cpp
if(mesh->mMaterialIndex >= 0)
{
    aiMaterial *material = scene->mMaterials[mesh->mMaterialIndex];
    vector<Texture> diffuseMaps = loadMaterialTextures(material,
                                        aiTextureType_DIFFUSE, "texture_diffuse");
    textures.insert(textures.end(), diffuseMaps.begin(), diffuseMaps.end());
    vector<Texture> specularMaps = loadMaterialTextures(material,
                                        aiTextureType_SPECULAR, "texture_specular");
    textures.insert(textures.end(), specularMaps.begin(), specularMaps.end());
}
```

## Advanced OpenGL

### Depth testing

当深度测试(Depth Testing)被启用的时候，OpenGL 会将一个片段的深度值与深度缓冲的内容进行对比

深度缓冲是在片段着色器运行之后在屏幕空间中运行的

gl_FragCoord 的 x 和 y 分量代表了片段的屏幕空间坐标（其中(0, 0)位于左下角）

gl_FragCoord 中也包含了一个 z 分量，它包含了片段真正的深度值，z 值就是需要与深度缓冲内容所对比的那个值

```cpp
glEnable(GL_DEPTH_TEST);
```

当它启用的时候，如果一个片段通过了深度测试的话，OpenGL 会在深度缓冲中储存该片段的 z 值；如果没有通过深度缓冲，则会丢弃该片段

```cpp
glDepthMask(GL_FALSE);	//使用一个只读的(Read-only)深度缓冲
```

#### 深度测试函数

OpenGL 允许我们修改深度测试中使用的比较运算符

```cpp
glDepthFunc(GL_LESS);	// 默认是GL_LESS,丢弃深度值大于等于当前深度缓冲值的所有片段
```

| 函数        | 描述                                         |
| :---------- | :------------------------------------------- |
| GL_ALWAYS   | 永远通过深度测试                             |
| GL_NEVER    | 永远不通过深度测试                           |
| GL_LESS     | 在片段深度值小于缓冲的深度值时通过测试       |
| GL_EQUAL    | 在片段深度值等于缓冲区的深度值时通过测试     |
| GL_LEQUAL   | 在片段深度值小于等于缓冲区的深度值时通过测试 |
| GL_GREATER  | 在片段深度值大于缓冲区的深度值时通过测试     |
| GL_NOTEQUAL | 在片段深度值不等于缓冲区的深度值时通过测试   |
| GL_GEQUAL   | 在片段深度值大于等于缓冲区的深度值时通过测试 |

#### 深度值精度

观察空间的 z 值可能是投影平截头体的**近平面**(Near)和**远平面**(Far)之间的任何值，我们需要一种方式来将这些观察空间的 z 值变换到[0, 1]范围之间

$$
\begin{equation} F_{depth} = \frac{z - near}{far - near} \end{equation}
$$

![image-20220920100420767](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220920100420767.png)

在实际情况中，希望 z 值很小的时候提供非常高的精度，而在 z 值很远的时候提供更少的精度

$$
\begin{equation} F_{depth} = \frac{1/z - 1/near}{1/far - 1/near} \end{equation}
$$

![image-20220920100517500](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220920100517500.png)

#### 深度冲突

在两个平面或者三角形非常紧密地平行排列在一起时会发生，深度缓冲没有足够的精度来决定两个形状哪个在前面。结果就是这两个形状不断地在切换前后顺序，这会导致很奇怪的花纹

#### 防止深度冲突

避免把多个物体摆得太靠近，以至于它们的一些三角形会重叠

尽可能将近平面设置远一些

使用更高精度的深度缓冲

### Stencil testing

当片段着色器处理完一个片段之后，模板测试(Stencil Test)会开始执行，和深度测试一样，它也可能会丢弃片段

模板测试是根据又一个缓冲来进行的，它叫做模板缓冲(Stencil Buffer)

![image-20220920110852876](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220920110852876.png)

模板缓冲操作允许我们在渲染片段时将模板缓冲设定为一个特定的值。

通过在渲染时修改模板缓冲的内容，我们**写入**了模板缓冲。

在同一个（或者接下来的）渲染迭代中，我们可以**读取**这些值，来决定丢弃还是保留某个片段。

大体的步骤如下：

- 启用模板缓冲的写入。
- 渲染物体，更新模板缓冲的内容。
- 禁用模板缓冲的写入。
- 渲染（其它）物体，这次根据模板缓冲的内容丢弃特定的片段。

```cpp
glEnable(GL_STENCIL_TEST);
```

```cpp
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);
```

glStencilMask 允许我们设置一个位掩码(Bitmask)，它会与将要写入缓冲的模板值进行与(AND)运算。

默认情况下设置的位掩码所有位都为 1，不影响输出，但如果我们将它设置为`0x00`，写入缓冲的所有模板值最后都会变成 0

```cpp
glStencilMask(0xFF); // 每一位写入模板缓冲时都保持原样
glStencilMask(0x00); // 每一位在写入模板缓冲时都会变成0（禁用写入）
```

#### 模板函数

`glStencilFunc` 描述了 OpenGL 应该对模板缓冲内容做什么

```cpp
glStencilFunc(GLenum func, GLint ref, GLuint mask)
```

- `func`：设置模板测试函数(Stencil Test Function)。这个测试函数将会应用到已储存的模板值上和 glStencilFunc 函数的`ref`值上。可用的选项有：GL_NEVER、GL_LESS、GL_LEQUAL、GL_GREATER、GL_GEQUAL、GL_EQUAL、GL_NOTEQUAL 和 GL_ALWAYS。它们的语义和深度缓冲的函数类似。
- `ref`：设置了模板测试的参考值(Reference Value)。模板缓冲的内容将会与这个值进行比较。
- `mask`：设置一个掩码，它将会与参考值和储存的模板值在测试比较它们之前进行与(AND)运算。初始情况下所有位都为 1。

glStencilOp 声明应该如何更新缓冲

```cpp
glStencilOp(GLenum sfail, GLenum dpfail, GLenum dppass)
```

- `sfail`：模板测试失败时采取的行为。
- `dpfail`：模板测试通过，但深度测试失败时采取的行为。
- `dppass`：模板测试和深度测试都通过时采取的行为。

每个选项都可以选用以下的其中一种行为：

| 行为         | 描述                                                   |
| :----------- | :----------------------------------------------------- |
| GL_KEEP      | 保持当前储存的模板值                                   |
| GL_ZERO      | 将模板值设置为 0                                       |
| GL_REPLACE   | 将模板值设置为 glStencilFunc 函数设置的`ref`值         |
| GL_INCR      | 如果模板值小于最大值则将模板值加 1                     |
| GL_INCR_WRAP | 与 GL_INCR 一样，但如果模板值超过了最大值则归零        |
| GL_DECR      | 如果模板值大于最小值则将模板值减 1                     |
| GL_DECR_WRAP | 与 GL_DECR 一样，但如果模板值小于 0 则将其设置为最大值 |
| GL_INVERT    | 按位翻转当前的模板缓冲值                               |

默认情况下 glStencilOp 是设置为`(GL_KEEP, GL_KEEP, GL_KEEP)`的，所以不论任何测试的结果是如何，模板缓冲都会保留它的值

#### 物体轮廓

为物体创建轮廓的步骤如下：

1. 在绘制（需要添加轮廓的）物体之前，将模板函数设置为 GL_ALWAYS，每当物体的片段被渲染时，将模板缓冲更新为 1。
2. 渲染物体。
3. 禁用模板写入以及深度测试。
4. 将每个物体 scale 一点点。
5. 使用一个不同的片段着色器，输出一个单独的（边框）颜色。
6. 再次绘制物体，但只在它们片段的模板值不等于 1 时才绘制。
7. 再次启用模板写入和深度测试。

![image-20220920131224388](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220920131224388.png)

```cpp
glEnable(GL_STENCIL_TEST);						// 启用模板测试
glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);		// 模板缓冲刷新方式

glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

glStencilMask(0x00); 							// 确保绘制地板时不会更新模板缓冲
normalShader.use();
DrawFloor()

glStencilFunc(GL_ALWAYS, 1, 0xFF); 				// 模板测试方法，始终通过
glStencilMask(0xFF); 							// 允许写入
DrawTwoContainers();

glStencilFunc(GL_NOTEQUAL, 1, 0xFF);			// 上述渲染范围之外的范围
glStencilMask(0x00); 							// 不允许写入
glDisable(GL_DEPTH_TEST);						// 禁用深度缓冲，避免和范围内的其他物体进行深度判断
shaderSingleColor.use();
DrawTwoScaledUpContainers();

glStencilMask(0xFF);
glEnable(GL_DEPTH_TEST);
```

### Blending

OpenGL 中，混合(Blending)通常是实现物体透明度(Transparency)的一种技术

![image-20220921091859106](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921091859106.png)

一个物体的透明度是通过它颜色的 alpha 值来决定的，Alpha 颜色值是颜色向量的第四个分量

```cpp
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
```

OpenGL 默认是不知道怎么处理 alpha 值，通常可以使用条件语句，当 alpha 值低于某个阈值时，使用 GLSL 的`discard`命令

```cpp
void main()
{
    vec4 texColor = texture(texture1, TexCoords);
    if(texColor.a < 0.1)
        discard;						// 被丢弃的片段不会进入颜色缓冲
    FragColor = texColor;
}
```

注意，当采样纹理的边缘的时候，OpenGL 会对边缘的值和纹理下一个重复的值进行插值（因为我们将它的环绕方式设置为了 GL_REPEAT）

这通常是没问题的，但是使用透明值时，纹理图像的顶部将会与底部边缘的纯色值进行插值。

这样的结果是一个半透明的有色边框，可能会看见它环绕着的纹理四边形。

要想避免这个，每当使用 alpha 纹理的时候，需要将纹理的环绕方式设置为 GL_CLAMP_TO_EDGE：

```cpp
glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
```

#### 混合

要想渲染有多个透明度级别的图像，我们需要启用混合(Blending)

```cpp
glEnable(GL_BLEND);
```

OpenGL 中的混合是通过下面这个方程来实现的：

$$
\begin{equation}\bar{C}_{result} = \bar{\color{green}C}_{source} * \color{green}F_{source} + \bar{\color{red}C}_{destination} * \color{red}F_{destination}\end{equation}
$$

![image-20220921101325511](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921101325511.png)

片段着色器运行完成后，并且所有的测试都通过之后，这个混合方程(Blend Equation)才会应用到片段颜色输出与当前颜色缓冲中的值（当前片段之前储存的之前片段的颜色）上。

源颜色和目标颜色将会由 OpenGL 自动设定，但源因子和目标因子的值可以由我们来决定

举例如下：

![image-20220921101549159](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921101549159.png)

我们有两个方形，我们希望将这个半透明的绿色方形绘制在红色方形之上。红色的方形将会是目标颜色（所以它应该先在颜色缓冲中），我们将要在这个红色方形之上绘制这个绿色方形。

我们想让绿色方形乘以它的 alpha 值，所以我们想要将 Fsrc 设置为源颜色向量的 alpha 值，也就是`0.6`。那么红色方块应该对最终颜色贡献了 40%，即`1.0 - 0.6`

$$
\begin{equation}\bar{C}_{result} = \begin{pmatrix} \color{red}{0.0} \\ \color{green}{1.0} \\ \color{blue}{0.0} \\ \color{purple}{0.6} \end{pmatrix} * \color{green}{0.6} + \begin{pmatrix} \color{red}{1.0} \\ \color{green}{0.0} \\ \color{blue}{0.0} \\ \color{purple}{1.0} \end{pmatrix} * \color{red}{(1 - 0.6)} \end{equation}
$$

![image-20220921101736828](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921101736828.png)

最终的颜色将会被储存到颜色缓冲中，替代之前的颜色。

```cpp
glBlendFunc(GLenum sfactor, GLenum dfactor)	//函数接受两个参数，来设置源和目标因子
```

![image-20220921101854335](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921101854335.png)

常数颜色向量 C¯constant 可以通过 glBlendColor 函数来另外设置

```cpp
glBlendEquation(GLenum mode)		// 允许我们设置运算符
```

![image-20220921102720819](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921102720819.png)

#### 渲染半透明纹理

问题：

深度测试和 blend 混用时，深度测试并不会检查片段是否透明，因而需要手动将物体由远到近进行排序来渲染

而对于全透明物体可以直接通过 GLSL 丢弃，因而不会出现此问题

![image-20220921103413854](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921103413854.png)

#### 不要打乱顺序

1. 先绘制所有不透明的物体。
2. 对所有透明的物体排序。
3. 按顺序绘制所有透明的物体。

利用 map 的自动排序特性

```cpp
std::map<float, glm::vec3> sorted;
for (unsigned int i = 0; i < windows.size(); i++)
{
    float distance = glm::length(camera.Position - windows[i]);
    sorted[distance] = windows[i];
}
```

```cpp
for(std::map<float,glm::vec3>::reverse_iterator it = sorted.rbegin(); it != sorted.rend(); ++it)
{
    model = glm::mat4();
    model = glm::translate(model, it->second);
    shader.setMat4("model", model);
    glDrawArrays(GL_TRIANGLES, 0, 6);
}
```

### Face culling

由于相机只能看到物体的部分面，剩余面在渲染过程中可以省略，即所谓 **面剔除（Face culling）**

在 face culling 中往往能省下超过 50%的执行数

#### 环绕顺序

为了区分正向面(Front Face)和背向面(Back Face)，OpenGL 采用环绕顺序(Winding Order)

![image-20220921140613768](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921140613768.png)

```cpp
float vertices[] = {
    // 顺时针
    vertices[0], // 顶点1
    vertices[1], // 顶点2
    vertices[2], // 顶点3
    // 逆时针
    vertices[0], // 顶点1
    vertices[2], // 顶点3
    vertices[1]  // 顶点2
};
```

每组组成三角形图元的三个顶点就包含了一个环绕顺序。OpenGL 在渲染图元的时候将使用这个信息来决定一个三角形是一个正向三角形还是背向三角形

默认情况下，逆时针顶点所定义的三角形将会被处理为正向三角形。

![image-20220921141134639](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220921141134639.png)

#### 面剔除

```cpp
glEnable(GL_CULL_FACE);
```

ps：注意这只对像立方体这样的封闭形状有效

```cpp
glCullFace(GL_FRONT);
```

- `GL_BACK`：只剔除背向面。（默认）
- `GL_FRONT`：只剔除正向面。
- `GL_FRONT_AND_BACK`：剔除正向面和背向面。

```cpp
glFrontFace(GL_CCW);
```

默认值是 GL_CCW，它代表的是逆时针的环绕顺序，另一个选项是 GL_CW，它（显然）代表的是顺时针顺序。

### Framebuffers

用于写入颜色值的颜色缓冲、用于写入深度信息的深度缓冲和允许我们根据一些条件丢弃特定片段的模板缓冲。这些缓冲结合起来叫做帧缓冲(Framebuffer)，它被储存在内存中

默认的帧缓冲是在创建窗口的时候生成和配置的（GLFW 帮我们做了这些）

```cpp
unsigned int fbo;
glGenFramebuffers(1, &fbo);
glBindFramebuffer(GL_FRAMEBUFFER, fbo);
```

首先我们创建一个帧缓冲对象，将它绑定为激活的(Active)帧缓冲

在绑定到`GL_FRAMEBUFFER`目标之后，所有的**读取**和**写入**帧缓冲的操作将会影响当前绑定的帧缓冲。

我们也可以使用`GL_READ_FRAMEBUFFER`或`GL_DRAW_FRAMEBUFFER`，将一个帧缓冲分别绑定到读取目标或写入目标。

绑定到`GL_READ_FRAMEBUFFER`的帧缓冲将会使用在所有像是`glReadPixels`的读取操作中，而绑定到`GL_DRAW_FRAMEBUFFER`的帧缓冲将会被用作渲染、清除等写入操作的目标。

通常都会使用`GL_FRAMEBUFFER`绑定到两个上。

一个完整的帧缓冲需要满足以下的条件：

- 附加至少一个缓冲（颜色、深度或模板缓冲）。
- 至少有一个颜色附件(Attachment)。
- 所有的附件都必须是完整的（保留了内存）。
- 每个缓冲都应该有相同的样本数。

`GL_FRAMEBUFFER`为参数调用`glCheckFramebufferStatus`，检查帧缓冲是否完整，会返回[这些值](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glCheckFramebufferStatus.xhtml)

```cpp
if(glCheckFramebufferStatus(GL_FRAMEBUFFER) == GL_FRAMEBUFFER_COMPLETE) // 帧缓冲完整
```

之后所有的渲染操作将会渲染到当前绑定帧缓冲的附件中。

由于我们的帧缓冲不是默认帧缓冲，渲染指令将不会对窗口的视觉输出有任何影响。

出于这个原因，渲染到一个不同的帧缓冲被叫做**离屏渲染(Off-screen Rendering)**。

要保证所有的渲染操作在主窗口中有视觉效果，我们需要再次激活默认帧缓冲，将它绑定到`0`。

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

附件是一个内存位置，它能够作为帧缓冲的一个缓冲，可以将它想象为一个图像

当创建一个附件的时候我们有两个选项：**纹理或渲染缓冲对象(Renderbuffer Object)**

#### 纹理附件

当把一个纹理附加到帧缓冲的时候，所有的渲染指令将会写入到这个纹理中

```cpp
unsigned int texture;
glGenTextures(1, &texture);
glBindTexture(GL_TEXTURE_2D, texture);

glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, 800, 600, 0, GL_RGB, GL_UNSIGNED_BYTE, NULL);

glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

和创建普通纹理的主要区别是，将维度设置为了屏幕大小（尽管这不是必须的），并且给纹理的`data`参数传递了`NULL`，对于这个纹理，我们仅仅分配了内存而没有填充它

```cpp
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, texture, 0);
```

`glFrameBufferTexture2D`有以下的参数：

- `target`：帧缓冲的目标（绘制、读取或者两者皆有）
- `attachment`：我们想要附加的附件类型。当前我们正在附加一个颜色附件。注意最后的`0`意味着我们可以附加多个颜色附件。我们将在之后的教程中提到。
- `textarget`：你希望附加的纹理类型
- `texture`：要附加的纹理本身
- `level`：多级渐远纹理的级别。我们将它保留为 0。

要附加深度缓冲的话，我们将附件类型设置为`GL_DEPTH_ATTACHMENT`。注意纹理的格式(Format)和内部格式(Internalformat)类型将变为`GL_DEPTH_COMPONENT`，来反映深度缓冲的储存格式

要附加模板缓冲的话，你要将第二个参数设置为`GL_STENCIL_ATTACHMENT`，并将纹理的格式设定为`GL_STENCIL_INDEX`

也可以将深度缓冲和模板缓冲附加为一个单独的纹理，纹理的每 32 位数值将包含 24 位的深度信息和 8 位的模板信息

```cpp
glTexImage2D(
  GL_TEXTURE_2D, 0, GL_DEPTH24_STENCIL8, 800, 600, 0,
  GL_DEPTH_STENCIL, GL_UNSIGNED_INT_24_8, NULL
);

glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_TEXTURE_2D, texture, 0);
```

#### 渲染缓冲对象附件

渲染缓冲对象附加的好处是，它会将数据储存为 OpenGL 原生的渲染格式，它是为离屏渲染到帧缓冲优化过的。

渲染缓冲对象直接将所有的渲染数据储存到它的缓冲中，不会做任何针对纹理格式的转换，让它变为一个更快的可写储存介质，**交换缓冲这样的操作在使用渲染缓冲对象时会非常快**

**渲染缓冲对象通常都是只写的，所以不能读取它们，它们会经常用于深度和模板附件**

```cpp
unsigned int rbo;
glGenRenderbuffers(1, &rbo);
glBindRenderbuffer(GL_RENDERBUFFER, rbo);
```

创建一个深度和模板渲染缓冲对象

```cpp
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH24_STENCIL8, 800, 600);
```

附加这个渲染缓冲对象

```cpp
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_STENCIL_ATTACHMENT, GL_RENDERBUFFER, rbo);
```

通常的规则是，如果不需要从一个缓冲中采样数据，那么对这个缓冲使用渲染缓冲对象会是明智的选择

如果需要从缓冲中采样颜色或深度值等数据，那么应该选择纹理附件

#### 渲染到纹理

帧缓冲的本质是是对三维模型的渲染结果直接打印在一个设定的四边形范围中

可以理解为，所见到的是一张对三维空间实时拍摄的照片，而不是真实的三维图像，但模拟出了相同的效果（虚拟现实的味道）

步骤：

先启用自定的帧缓冲，随后对三维物体进行渲染，此时渲染结果将存储于该帧缓冲所绑定的纹理中

随后，重新绑定回默认的帧缓冲，关闭深度测试，进行纹理绘制，此时将会把自定的帧缓冲中所绑定的纹理的图像绘制到屏幕上

![image-20220922102956994](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922102956994.png)

切换到线框模式可以容易发现，我们看到的本质是两个三角面组成的图像，并非真实的三维模型

#### 后期处理

##### 反相

```cpp
void main()
{
    FragColor = vec4(vec3(1.0 - texture(screenTexture, TexCoords)), 1.0);
}
```

![image-20220922111326004](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922111326004.png)

##### 灰度

取所有的颜色分量，将它们平均化

```cpp
void main()
{
    FragColor = texture(screenTexture, TexCoords);
    float average = (FragColor.r + FragColor.g + FragColor.b) / 3.0;
    FragColor = vec4(average, average, average, 1.0);
}
```

![image-20220922115724306](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922115724306.png)

##### 核效果(卷积)

$$
\begin{bmatrix}2 & 2 & 2 \\ 2 & -15 & 2 \\ 2 & 2 & 2 \end{bmatrix}
$$

大部分核将所有的权重加起来之后都应该会等于 1，如果它们加起来不等于 1，这就意味着最终的纹理颜色将会比原纹理值更亮或者更暗了。

```cpp
const float offset = 1.0 / 300.0;

void main()
{
    vec2 offsets[9] = vec2[](
        vec2(-offset,  offset), // 左上
        vec2( 0.0f,    offset), // 正上
        vec2( offset,  offset), // 右上
        vec2(-offset,  0.0f),   // 左
        vec2( 0.0f,    0.0f),   // 中
        vec2( offset,  0.0f),   // 右
        vec2(-offset, -offset), // 左下
        vec2( 0.0f,   -offset), // 正下
        vec2( offset, -offset)  // 右下
    );

    float kernel[9] = float[](	// 锐化核
        -1, -1, -1,
        -1,  9, -1,
        -1, -1, -1
    );

    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = vec3(texture(screenTexture, TexCoords.st + offsets[i]));
    }
    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
        col += sampleTex[i] * kernel[i];

    FragColor = vec4(col, 1.0);
}
```

![image-20220922120116442](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922120116442.png)

##### 模糊

$$
\begin{bmatrix} 1 & 2 & 1 \\ 2 & 4 & 2 \\ 1 & 2 & 1 \end{bmatrix} / 16
$$

![image-20220922120209347](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922120209347.png)

##### 边缘检测

$$
\begin{bmatrix} 1 & 1 & 1 \\ 1 & -8 & 1 \\ 1 & 1 & 1 \end{bmatrix}
$$

![image-20220922120255014](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922120255014.png)

### CubeMaps(立方体贴图)

将多个纹理组合起来映射到一张纹理上的一种纹理类型：立方体贴图(Cube Map)。

立方体贴图有一个非常有用的特性，它可以通过一个方向向量来进行索引/采样

![image-20220922121000829](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922121000829.png)

#### 创建立方体贴图

```cpp
unsigned int textureID;
glGenTextures(1, &textureID);
glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);
```

由于立方体有 6 个面，OpenGL 提供了 6 个特殊的纹理目标，专门对应立方体贴图的一个面

| 纹理目标                         | 方位 |
| :------------------------------- | :--- |
| `GL_TEXTURE_CUBE_MAP_POSITIVE_X` | 右   |
| `GL_TEXTURE_CUBE_MAP_NEGATIVE_X` | 左   |
| `GL_TEXTURE_CUBE_MAP_POSITIVE_Y` | 上   |
| `GL_TEXTURE_CUBE_MAP_NEGATIVE_Y` | 下   |
| `GL_TEXTURE_CUBE_MAP_POSITIVE_Z` | 后   |
| `GL_TEXTURE_CUBE_MAP_NEGATIVE_Z` | 前   |

和 OpenGL 的很多枚举(Enum)一样，它们背后的 int 值是线性递增的，所以如果我们有一个纹理位置的数组或者 vector，我们就可以从`GL_TEXTURE_CUBE_MAP_POSITIVE_X`开始遍历它们，在每个迭代中对枚举值加 1，遍历了整个纹理目标

```cpp
int width, height, nrChannels;
unsigned char *data;
for(unsigned int i = 0; i < textures_faces.size(); i++)
{
    data = stbi_load(textures_faces[i].c_str(), &width, &height, &nrChannels, 0);
    glTexImage2D(
        GL_TEXTURE_CUBE_MAP_POSITIVE_X + i,
        0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data
    );
}
```

```cpp
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
```

```cpp
in vec3 textureDir; // 代表3D纹理坐标的方向向量
uniform samplerCube cubemap; // 立方体贴图的纹理采样器

void main()
{
    FragColor = texture(cubemap, textureDir);
}
```

#### 天空盒(Skybox)

天空盒是一个包含了整个场景的（大）立方体，它包含周围环境的 6 个图像，让玩家以为他处在一个比实际大得多的环境当中

![image-20220922123258628](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922123258628.png)

#### 加载天空盒

```cpp
unsigned int loadCubemap(vector<std::string> faces)
{
    unsigned int textureID;
    glGenTextures(1, &textureID);
    glBindTexture(GL_TEXTURE_CUBE_MAP, textureID);

    int width, height, nrChannels;
    for (unsigned int i = 0; i < faces.size(); i++)
    {
        unsigned char *data = stbi_load(faces[i].c_str(), &width, &height, &nrChannels, 0);
        if (data)
        {
            glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
            stbi_image_free(data);
        }
        else
        {
            std::cout << "Cubemap texture failed to load at path: " << faces[i] << std::endl;
            stbi_image_free(data);
        }
    }
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);

    return textureID;
}
```

#### 显示天空盒

当立方体处于原点(0, 0, 0)时，它的每一个位置向量都是从原点出发的方向向量。这个方向向量正是获取立方体上特定位置的纹理值所需要的

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

out vec3 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
        TexCoords = aPos		//将输入的位置向量作为输出给片段着色器的纹理坐标
    gl_Position = projection * view * vec4(aPos, 1.0);
}
```

```cpp
#version 330 core
out vec4 FragColor;

in vec3 TexCoords;

uniform samplerCube skybox;		// 纹理形式

void main()
{
    FragColor = texture(skybox, TexCoords);
}
```

为了移除观察矩阵的位移部分，避免立方体贴图跟着移动：

```cpp
glm::mat4 view = glm::mat4(glm::mat3(camera.GetViewMatrix()));
```

![image-20220922171551061](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922171551061.png)

#### 优化

考虑到并非所有的立方体贴图都能在同一时间看到，可过滤被遮挡的部分

采用提前深度测试(Early Depth Testing)，令天空盒的深度值为 1.0，当遇到小于该值，表面有遮挡，则不渲染

**透视除法**是在顶点着色器运行之后执行的，即将 gl_Position 的`xyz`坐标除以 w 分量，而相除结果的 z 分量等于顶点的深度值

因此可以将输出位置的 z 分量等于它的 w 分量，让 z 分量永远等于 1.0，当透视除法执行之后，z 分量会变为`w / w = 1.0`

```cpp
void main()
{
    TexCoords = aPos;
    vec4 pos = projection * view * vec4(aPos, 1.0);
    gl_Position = pos.xyww;			// 深度值处理
}
```

最终的**标准化设备坐标**将永远会有一个等于 1.0 的 z 值：最大的深度值

同时，需要将默认的 GL_LESS 改为 GL_LEQUAL，深度缓冲将会填充上天空盒的 1.0 值，所以需要保证天空盒在值小于或等于深度缓冲而不是小于时通过深度测试

#### 环境映射

##### 反射

![image-20220922181739297](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220922181739297.png)

![image-20220923080054017](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923080054017.png)

```cpp
// fragment
void main()
{
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}
// vertex
void main()
{
    Normal = mat3(transpose(inverse(model))) * aNormal;
    Position = vec3(model * vec4(aPos, 1.0));
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

##### 折射

![image-20220923091407637](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923091407637.png)

| 材质 | 折射率 |
| :--- | :----- |
| 空气 | 1.00   |
| 水   | 1.33   |
| 冰   | 1.309  |
| 玻璃 | 1.52   |
| 钻石 | 2.42   |

```cpp
void main()
{
    float ratio = 1.00 / 1.52;
    vec3 I = normalize(Position - cameraPos);
    vec3 R = refract(I, normalize(Normal), ratio);
    FragColor = vec4(texture(skybox, R).rgb, 1.0);
}
```

### Advanced Data 高级数据

OpenGL 中的缓冲只是一个管理特定内存块的对象，没有其他功能，当其被绑定到一个缓冲目标(Buffer Target)，才具备了意义

```cpp
glBufferData(..., NULL)		// 只会分配内存，但不进行填充
```

```cpp
// 调用glBufferSubData之前必须先调用glBufferData分配足够的内存
// target, offset, size, data	在某个偏移位置填充数据
glBufferSubData(GL_ARRAY_BUFFER, 24, sizeof(data), &data); // 范围： [24, 24 + sizeof(data)]
```

```cpp
// glMapBuffer 获得当前绑定缓存的内存指针
float data[] = {
  0.5f, 1.0f, -0.35f
  ...
};
glBindBuffer(GL_ARRAY_BUFFER, buffer);
// 获取指针
void *ptr = glMapBuffer(GL_ARRAY_BUFFER, GL_WRITE_ONLY);
// 复制数据到内存
memcpy(ptr, data, sizeof(data));
// 记得告诉OpenGL我们不再需要这个指针了
glUnmapBuffer(GL_ARRAY_BUFFER);
```

如果要直接映射数据到缓冲，而不事先将其存储到临时内存中，glMapBuffer 这个函数会很有用

#### 分批顶点属性

`glVertexAttribPointer` 能够指定顶点数组缓冲内容的属性布局

在之前的顶点属性处理中，我们采用的是交错(Interleave)处理，即`123123`模式，每一个顶点的位置、法线和/或纹理坐标紧密放置在一起

当采用分批(Batched)的方式，即 112233 模式，可避免费力生成一个交错的大数组

```cpp
float positions[] = { ... };
float normals[] = { ... };
float tex[] = { ... };
// 填充缓冲
glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(positions), &positions);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions), sizeof(normals), &normals);
glBufferSubData(GL_ARRAY_BUFFER, sizeof(positions) + sizeof(normals), sizeof(tex), &tex);
```

```cpp
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), 0);
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)(sizeof(positions)));
glVertexAttribPointer(
  2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)(sizeof(positions) + sizeof(normals)));
```

#### 复制缓冲

```cpp
void glCopyBufferSubData(GLenum readtarget, GLenum writetarget, GLintptr readoffset, GLintptr writeoffset, GLsizeiptr size);
```

`readtarget`和`writetarget`参数需要填入复制源和复制目标的缓冲目标。

比如说，我们可以将`VERTEX_ARRAY_BUFFER`缓冲复制到`VERTEX_ELEMENT_ARRAY_BUFFER`缓冲，分别将这些缓冲目标设置为读和写的目标。当前绑定到这些缓冲目标的缓冲将会被影响到

若两个缓冲类型相同，则可分别绑定到`GL_COPY_READ_BUFFER`和`GL_COPY_WRITE_BUFFER`，作为函数参数

```cpp
float vertexData[] = { ... };
glBindBuffer(GL_COPY_READ_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, sizeof(vertexData));
```

```cpp
float vertexData[] = { ... };
glBindBuffer(GL_ARRAY_BUFFER, vbo1);
glBindBuffer(GL_COPY_WRITE_BUFFER, vbo2);
glCopyBufferSubData(GL_ARRAY_BUFFER, GL_COPY_WRITE_BUFFER, 0, 0, sizeof(vertexData));
```

### Advanced GLSL

#### GLSL 的内建变量

#### 顶点着色器变量

##### gl_Position（输出变量）

顶点着色器的裁剪空间输出位置向量

##### gl_PointSize（输出变量）

它是一个 float 变量，可以使用它来设置点的宽高（像素）

```cpp
glEnable(GL_PROGRAM_POINT_SIZE);

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    gl_PointSize = gl_Position.z;
}
```

![image-20220923095459205](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923095459205.png)

##### gl_VertexID（输入变量）

储存了正在绘制顶点的当前 ID

当（使用 glDrawElements）进行索引渲染的时候，这个变量会存储正在绘制顶点的当前索引。

当（使用 glDrawArrays）不使用索引进行绘制的时候，这个变量会储存从渲染调用开始的已处理顶点数量。

#### 片段着色器变量

##### gl_FragCoord

gl_FragCoord 的 x 和 y 分量是片段的窗口空间(Window-space)坐标，其原点为窗口的左下角

```cpp
void main()
{
    if(gl_FragCoord.x < 400)
        FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    else
        FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
```

![image-20220923095831669](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923095831669.png)

##### gl_FrontFacing

是个布尔值，正向面时为`true`，反向面时为`false`

```cpp
#version 330 core
out vec4 FragColor;

in vec2 TexCoords;

uniform sampler2D frontTexture;
uniform sampler2D backTexture;

void main()
{
    if(gl_FrontFacing)
        FragColor = texture(frontTexture, TexCoords);
    else
        FragColor = texture(backTexture, TexCoords);
}
```

![image-20220923100039445](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923100039445.png)

##### gl_FragDepth

可以在着色器内设置片段的深度值

```cpp
gl_FragDepth = 0.0; // 这个片段现在的深度值为 0.0
```

只要在片段着色器中对`gl_FragDepth`进行写入，OpenGL 就会禁用所有的提前深度测试(Early Depth Testing)

然而，从 OpenGL 4.2 起，可以对两者进行一定的调和，在片段着色器的顶部使用深度条件(Depth Condition)重新声明`gl_FragDepth`变量：

```cpp
layout (depth_<condition>) out float gl_FragDepth;
```

`condition`可以为下面的值：

| 条件        | 描述                                                         |
| :---------- | :----------------------------------------------------------- |
| `any`       | 默认值。提前深度测试是禁用的，你会损失很多性能               |
| `greater`   | 你只能让深度值比`gl_FragCoord.z`更大                         |
| `less`      | 你只能让深度值比`gl_FragCoord.z`更小                         |
| `unchanged` | 如果你要写入`gl_FragDepth`，你将只能写入`gl_FragCoord.z`的值 |

通过将深度条件设置为`greater`或者`less`，OpenGL 就能假设你只会写入比当前片段深度值更大或者更小的值了。这样子的话，当深度值比片段的深度值要小的时候，OpenGL 仍是能够进行提前深度测试的

```cpp
#version 420 core // 注意GLSL的版本！
out vec4 FragColor;
layout (depth_greater) out float gl_FragDepth;

void main()
{
    FragColor = vec4(1.0);
    gl_FragDepth = gl_FragCoord.z + 0.1;
}
```

#### 接口块

接口块便于管理着色器之间传递的变量，其形式类似于结构体

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoords;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out VS_OUT
{
    vec2 TexCoords;
} vs_out;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
    vs_out.TexCoords = aTexCoords;
}
```

```cpp
#version 330 core
out vec4 FragColor;

in VS_OUT				// 块名应和前置着色器一致
{
    vec2 TexCoords;
} fs_in;				// 实例名可不同

uniform sampler2D texture;

void main()
{
    FragColor = texture(texture, fs_in.TexCoords);
}
```

#### Uniform 缓冲对象

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

layout (std140) uniform Matrices
{
    mat4 projection;
    mat4 view;
};

uniform mat4 model;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

Uniform 块中的变量可以直接访问，不需要加块名作为前缀

在 OpenGL 代码中将这些矩阵值存入缓冲中，每个声明了这个 Uniform 块的着色器都能够访问这些矩阵。

#### Uniform 块布局

GLSL 默认使用共享(Shared)布局，使用共享布局时，GLSL 是可以为了优化而对 uniform 变量的位置进行变动的，只要变量的顺序保持不变。

但是，我们无法知道每个 uniform 变量的偏移量，也就不知道如何准确地填充我们的 Uniform 缓冲了

通常为了计算方便，**使用 std140 布局**

每个变量都有一个**基准对齐量(Base Alignment)**，它等于一个变量在 Uniform 块中所占据的空间（包括填充量(Padding)），这个基准对齐量是使用 std140 布局的规则计算出来的。

接下来，对每个变量，再计算它的**对齐偏移量(Aligned Offset)**，它是一个变量从块起始位置的字节偏移量。

**一个变量的对齐字节偏移量必须等于基准对齐量的倍数。**

布局规则的原文可以在 OpenGL 的 Uniform 缓冲规范[这里](http://www.opengl.org/registry/specs/ARB/uniform_buffer_object.txt)找到

GLSL 中的每个变量，比如说 int、float 和 bool，都被定义为 4 字节量。

**每 4 个字节将会用一个`N`来表示。**

| 类型                   | 布局规则                                                       |
| :--------------------- | :------------------------------------------------------------- |
| 标量，比如 int 和 bool | 每个标量的基准对齐量为 N。                                     |
| 向量                   | 2N 或者 4N。这意味着 vec3 的基准对齐量为 4N。                  |
| 标量或向量的数组       | 每个元素的基准对齐量与 vec4 的相同。                           |
| 矩阵                   | 储存为列向量的数组，每个向量的基准对齐量与 vec4 的相同。       |
| 结构体                 | 等于所有元素根据规则计算后的大小，但会填充到 vec4 大小的倍数。 |

```cpp
layout (std140) uniform ExampleBlock
{
                     // 基准对齐量       // 对齐偏移量
    float value;     // 4               // 0
    vec3 vector;     // 16              // 16  (必须是16的倍数，所以 4->16)
    mat4 matrix;     // 16              // 32  (列 0)
                     // 16              // 48  (列 1)
                     // 16              // 64  (列 2)
                     // 16              // 80  (列 3)
    float values[3]; // 16              // 96  (values[0])
                     // 16              // 112 (values[1])
                     // 16              // 128 (values[2])
    bool boolean;    // 4               // 144
    int integer;     // 4               // 148
};
```

#### 使用 Uniform 缓冲

```cpp
unsigned int uboExampleBlock;
glGenBuffers(1, &uboExampleBlock);
glBindBuffer(GL_UNIFORM_BUFFER, uboExampleBlock);
glBufferData(GL_UNIFORM_BUFFER, 152, NULL, GL_STATIC_DRAW); // 分配152字节的内存
glBindBuffer(GL_UNIFORM_BUFFER, 0);
```

在 OpenGL 上下文中，定义了一些**绑定点(Binding Point)**，我们可以将一个 Uniform 缓冲链接至它

在创建 Uniform 缓冲之后，我们将它绑定到其中一个绑定点上，并将着色器中的 Uniform 块绑定到相同的绑定点，把它们连接到一起

![image-20220923140102526](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923140102526.png)

```cpp
unsigned int lights_index = glGetUniformBlockIndex(shaderA.ID, "Lights");
glUniformBlockBinding(shaderA.ID, lights_index, 2);
```

需要对**每个**着色器重复这一步骤

PS：从 OpenGL 4.2 版本起，可以添加一个布局标识符，显式地将 Uniform 块的绑定点储存在着色器中，这样就不用再调用`glGetUniformBlockIndex`和`glUniformBlockBinding`了

```cpp
layout(std140, binding = 2) uniform Lights { ... };
```

接下来，还需要绑定 Uniform 缓冲对象到相同的绑定点上，这可以使用`glBindBufferBase`或`glBindBufferRange`来完成

```cpp
glBindBufferBase(GL_UNIFORM_BUFFER, 2, uboExampleBlock);
// 或
glBindBufferRange(GL_UNIFORM_BUFFER, 2, uboExampleBlock, 0, 152);
```

`glBindbufferBase`需要一个目标，一个绑定点索引和一个 Uniform 缓冲对象作为它的参数

`glBindBufferRange`函数需要一个附加的偏移量和大小参数，这样子可以绑定 Uniform 缓冲的特定一部分到绑定点中

**用以下方式更新 Uniform 缓冲对象：**

```cpp
glBindBuffer(GL_UNIFORM_BUFFER, uboExampleBlock);
int b = true; // GLSL中的bool是4字节的，所以我们将它存为一个integer
glBufferSubData(GL_UNIFORM_BUFFER, 144, 4, &b);
glBindBuffer(GL_UNIFORM_BUFFER, 0);
```

##### 一个简单的例子

顶点着色器中将相同的矩阵放入一个 uniform 块

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

layout (std140) uniform Matrices
{
    mat4 projection;
    mat4 view;
};
uniform mat4 model;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0);
}
```

各个 shader 绑定到相同的绑定点 0：

```cpp
unsigned int uniformBlockIndexRed    = glGetUniformBlockIndex(shaderRed.ID, "Matrices");
unsigned int uniformBlockIndexGreen  = glGetUniformBlockIndex(shaderGreen.ID, "Matrices");
unsigned int uniformBlockIndexBlue   = glGetUniformBlockIndex(shaderBlue.ID, "Matrices");
unsigned int uniformBlockIndexYellow = glGetUniformBlockIndex(shaderYellow.ID, "Matrices");

glUniformBlockBinding(shaderRed.ID,    uniformBlockIndexRed, 0);
glUniformBlockBinding(shaderGreen.ID,  uniformBlockIndexGreen, 0);
glUniformBlockBinding(shaderBlue.ID,   uniformBlockIndexBlue, 0);
glUniformBlockBinding(shaderYellow.ID, uniformBlockIndexYellow, 0);
```

创建 Uniform 缓冲对象本身，并将其绑定到绑定点 0：

```cpp
unsigned int uboMatrices;
glGenBuffers(1, &uboMatrices);
glBindBuffer(GL_UNIFORM_BUFFER, uboMatrices);
glBufferData(GL_UNIFORM_BUFFER, 2 * sizeof(glm::mat4), NULL, GL_STATIC_DRAW);
glBindBuffer(GL_UNIFORM_BUFFER, 0);

glBindBufferRange(GL_UNIFORM_BUFFER, 0, uboMatrices, 0, 2 * sizeof(glm::mat4));
```

```cpp
glm::mat4 projection = glm::perspective(glm::radians(45.0f), (float)width/(float)height, 0.1f, 100.0f);
glBindBuffer(GL_UNIFORM_BUFFER, uboMatrices);
glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(glm::mat4), glm::value_ptr(projection));
glBindBuffer(GL_UNIFORM_BUFFER, 0);

glm::mat4 view = camera.GetViewMatrix();
glBindBuffer(GL_UNIFORM_BUFFER, uboMatrices);
glBufferSubData(GL_UNIFORM_BUFFER, sizeof(glm::mat4), sizeof(glm::mat4), glm::value_ptr(view));
glBindBuffer(GL_UNIFORM_BUFFER, 0);
```

```cpp
glBindVertexArray(cubeVAO);
shaderRed.use();
glm::mat4 model;
model = glm::translate(model, glm::vec3(-0.75f, 0.75f, 0.0f));  // 移动到左上角
shaderRed.setMat4("model", model);
glDrawArrays(GL_TRIANGLES, 0, 36);
// ... 绘制绿色立方体
// ... 绘制蓝色立方体
// ... 绘制黄色立方体
```

![image-20220923141521861](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220923141521861.png)

Uniform 缓冲对象比起独立的 uniform 有很多好处：

1. 一次设置很多 uniform 会比一个一个设置多个 uniform 要快很多
2. 比起在多个着色器中修改同样的 uniform，在 Uniform 缓冲中修改一次会更容易一些
3. OpenGL 限制了它能够处理的 uniform 数量，当使用 Uniform 缓冲对象时，最大的数量会更高

### Geometry Shader

```cpp
#version 330 core
layout (points) in;
layout (line_strip, max_vertices = 2) out;

void main() {
    gl_Position = gl_in[0].gl_Position + vec4(-0.1, 0.0, 0.0, 0.0);
    EmitVertex();

    gl_Position = gl_in[0].gl_Position + vec4( 0.1, 0.0, 0.0, 0.0);
    EmitVertex();

    EndPrimitive();
}
```

在几何着色器的顶部，我们需要声明从顶点着色器输入的图元类型。这需要在 in 关键字前声明一个布局修饰符(Layout Qualifier)。这个输入布局修饰符可以从顶点着色器接收下列任何一个图元值：

- `points`：绘制 GL_POINTS 图元时（1）。
- `lines`：绘制 GL_LINES 或 GL_LINE_STRIP 时（2）
- `lines_adjacency`：GL_LINES_ADJACENCY 或 GL_LINE_STRIP_ADJACENCY（4）
- `triangles`：GL_TRIANGLES、GL_TRIANGLE_STRIP 或 GL_TRIANGLE_FAN（3）
- `triangles_adjacency`：GL_TRIANGLES_ADJACENCY 或 GL_TRIANGLE_STRIP_ADJACENCY（6）

括号内的数字表示的是一个图元所包含的最小顶点数

还需要指定几何着色器输出的图元类型，这需要在 out 关键字前面加一个布局修饰符：

- `points`
- `line_strip`
- `triangle_strip`

几何着色器同时希望我们设置一个它最大能够输出的顶点数量（如果超过了这个值，OpenGL 将不会绘制多出的顶点）

为了生成更有意义的结果，我们需要某种方式来获取前一着色器阶段的输出。GLSL 提供给我们一个内建(Built-in)变量，在内部看起来（可能）是这样的

```cpp
in gl_Vertex
{
    vec4  gl_Position;
    float gl_PointSize;
    float gl_ClipDistance[];
} gl_in[];
```

要注意的是，它被声明为一个数组，因为大多数的渲染图元包含多于 1 个的顶点，而几何着色器的输入是一个图元的**所有**顶点

有了之前顶点着色器阶段的顶点数据，我们就可以使用 2 个几何着色器函数，`EmitVertex`和`EndPrimitive`，来生成新的数据

调用`EmitVertex`时，gl_Position 中的向量会被添加到图元中来

当`EndPrimitive`被调用时，所有发射出的(Emitted)顶点都会合成为指定的输出渲染图元

#### 使用几何着色器

```cpp
// vertex
#version 330 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec3 aColor;

out VS_OUT {
    vec3 color;
} vs_out;

void main()
{
    vs_out.color = aColor;
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0);
}

// geometry
#version 330 core
layout (points) in;
layout (triangle_strip, max_vertices = 5) out;

in VS_OUT {
    vec3 color;
} gs_in[];

out vec3 fColor;

void build_house(vec4 position)
{
    fColor = gs_in[0].color; // gs_in[0] since there's only one input vertex
    gl_Position = position + vec4(-0.2, -0.2, 0.0, 0.0); // 1:bottom-left
    EmitVertex();
    gl_Position = position + vec4( 0.2, -0.2, 0.0, 0.0); // 2:bottom-right
    EmitVertex();
    gl_Position = position + vec4(-0.2,  0.2, 0.0, 0.0); // 3:top-left
    EmitVertex();
    gl_Position = position + vec4( 0.2,  0.2, 0.0, 0.0); // 4:top-right
    EmitVertex();
    gl_Position = position + vec4( 0.0,  0.4, 0.0, 0.0); // 5:top
    fColor = vec3(1.0, 1.0, 1.0);
    EmitVertex();
    EndPrimitive();
}

void main() {
    build_house(gl_in[0].gl_Position);
}

// fragment
#version 330 core
out vec4 FragColor;

in vec3 fColor;

void main()
{
    FragColor = vec4(fColor, 1.0);
}
```

#### 爆破物体

获取法线方向，根据法线方向进行位移

```cpp
// geometry
#version 330 core
layout (triangles) in;
layout (triangle_strip, max_vertices = 3) out;

in VS_OUT {
    vec2 texCoords;
} gs_in[];

out vec2 TexCoords;

uniform float time;

vec3 GetNormal()
{
   vec3 a = vec3(gl_in[0].gl_Position) - vec3(gl_in[1].gl_Position);
   vec3 b = vec3(gl_in[2].gl_Position) - vec3(gl_in[1].gl_Position);
   return normalize(cross(a, b));
}
vec4 explode(vec4 position, vec3 normal)
{
    float magnitude = 2.0;
    vec3 direction = normal * ((sin(time) + 1.0) / 2.0) * magnitude;
    return position + vec4(direction, 0.0);
}

void main() {
    vec3 normal = GetNormal();

    gl_Position = explode(gl_in[0].gl_Position, normal);
    TexCoords = gs_in[0].texCoords;
    EmitVertex();
    gl_Position = explode(gl_in[1].gl_Position, normal);
    TexCoords = gs_in[1].texCoords;
    EmitVertex();
    gl_Position = explode(gl_in[2].gl_Position, normal);
    TexCoords = gs_in[2].texCoords;
    EmitVertex();
    EndPrimitive();
}

```

#### 法向量可视化

由于几何着色器接收的是观察空间的坐标，因此在顶点着色器中，仅将 object 坐标转换为观察空间，在几何着色器中再转换为裁剪空间坐标

```cpp
// vertex
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;

out VS_OUT {
    vec3 normal;
} vs_out;

uniform mat4 view;
uniform mat4 model;

void main()
{
    gl_Position = view * model * vec4(aPos, 1.0);
    mat3 normalMatrix = mat3(transpose(inverse(view * model)));
    vs_out.normal = normalize(vec3(vec4(normalMatrix * aNormal, 0.0)));
}

// geometry
#version 330 core
layout (triangles) in;
layout (line_strip, max_vertices = 6) out;

in VS_OUT {
    vec3 normal;
} gs_in[];

const float MAGNITUDE = 0.4;

uniform mat4 projection;

void GenerateLine(int index)
{
    gl_Position = projection * gl_in[index].gl_Position;
    EmitVertex();
    gl_Position = projection * (gl_in[index].gl_Position +
                                vec4(gs_in[index].normal, 0.0) * MAGNITUDE);
    EmitVertex();
    EndPrimitive();
}

void main()
{
    GenerateLine(0); // 第一个顶点法线
    GenerateLine(1); // 第二个顶点法线
    GenerateLine(2); // 第三个顶点法线
}
```

![image-20220926134829073](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220926134829073.png)

### Instancing 实例化

当需要绘制大量的重复 object 时，避免 CPU 和 GPU 之间的多次通信造成的损耗，实例化可令 CPU 将渲染信息一次性全部发给 GPU，进而加快渲染速度

只需要将`glDrawArrays`和`glDrawElements`的渲染调用分别改为`glDrawArraysInstanced`和`glDrawElementsInstanced`就可以了

但函数只会在同个位置渲染同个物体多次，此时需要顶点着色器的内建变量`gl_InstanceID`

在使用实例化渲染调用时，gl_InstanceID 会从 0 开始，在每个实例被渲染时递增 1。

比如说，我们正在渲染第 43 个实例，那么顶点着色器中它的 gl_InstanceID 将会是 42。

因为每个实例都有唯一的 ID，我们可以建立一个数组，将 ID 与位置值对应起来，将每个实例放置在世界的不同位置。

以绘制多个 2D 四边形为例：

```cpp
#version 330 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec3 aColor;

out vec3 fColor;

uniform vec2 offsets[100];

void main()
{
    vec2 offset = offsets[gl_InstanceID];
    gl_Position = vec4(aPos + offset, 0.0, 1.0);	// 由于是2D，因而z=0
    fColor = aColor;
}
```

#### 实例化数组

当要渲染远超过 100 个实例的时候，最终会超过能够发送至着色器的 uniform 数据大小的[上限](<http://www.opengl.org/wiki/Uniform_(GLSL)#Implementation_limits>)

一个代替方案是实例化数组(Instanced Array)，它被定义为一个顶点属性（能够储存更多的数据），仅在顶点着色器渲染一个新的实例时才会更新

```cpp
#version 330 core
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aOffset;

out vec3 fColor;

void main()
{
    gl_Position = vec4(aPos + aOffset, 0.0, 1.0);
    fColor = aColor;
}
```

```cpp
unsigned int instanceVBO;
glGenBuffers(1, &instanceVBO);
glBindBuffer(GL_ARRAY_BUFFER, instanceVBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec2) * 100, &translations[0], GL_STATIC_DRAW);
glBindBuffer(GL_ARRAY_BUFFER, 0);

glEnableVertexAttribArray(2);
glBindBuffer(GL_ARRAY_BUFFER, instanceVBO);
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)0);
glBindBuffer(GL_ARRAY_BUFFER, 0);
glVertexAttribDivisor(2, 1);
```

`glVertexAttribDivisor`的第一个参数是需要的顶点属性，第二个参数是属性除数(Attribute Divisor)

默认情况下，属性除数是 0，告诉 OpenGL 我们需要在顶点着色器的每次迭代时更新顶点属性

设置为 1 时，我们告诉 OpenGL 我们希望在渲染一个新实例的时候更新顶点属性

设置为 2 时，我们希望每 2 个实例更新一次属性，以此类推

#### 小行星带

设置偏移矩阵

```cpp
unsigned int amount = 1000;
glm::mat4 *modelMatrices;
modelMatrices = new glm::mat4[amount];
srand(glfwGetTime()); // 初始化随机种子
float radius = 50.0;
float offset = 2.5f;
for(unsigned int i = 0; i < amount; i++)
{
    glm::mat4 model;
    // 1. 位移：分布在半径为 'radius' 的圆形上，偏移的范围是 [-offset, offset]
    float angle = (float)i / (float)amount * 360.0f;
    float displacement = (rand() % (int)(2 * offset * 100)) / 100.0f - offset;
    float x = sin(angle) * radius + displacement;
    displacement = (rand() % (int)(2 * offset * 100)) / 100.0f - offset;
    float y = displacement * 0.4f; // 让行星带的高度比x和z的宽度要小
    displacement = (rand() % (int)(2 * offset * 100)) / 100.0f - offset;
    float z = cos(angle) * radius + displacement;
    model = glm::translate(model, glm::vec3(x, y, z));

    // 2. 缩放：在 0.05 和 0.25f 之间缩放
    float scale = (rand() % 20) / 100.0f + 0.05;
    model = glm::scale(model, glm::vec3(scale));

    // 3. 旋转：绕着一个（半）随机选择的旋转轴向量进行随机的旋转
    float rotAngle = (rand() % 360);
    model = glm::rotate(model, rotAngle, glm::vec3(0.4f, 0.6f, 0.8f));

    // 4. 添加到矩阵的数组中
    modelMatrices[i] = model;
}
```

使用实例化数组

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 2) in vec2 aTexCoords;
layout (location = 3) in mat4 instanceMatrix;

out vec2 TexCoords;

uniform mat4 projection;
uniform mat4 view;

void main()
{
    gl_Position = projection * view * instanceMatrix * vec4(aPos, 1.0);
    TexCoords = aTexCoords;
}
```

顶点属性最大允许的数据大小等于一个 vec4，而一个 mat4 本质上是 4 个 vec4，我们需要为这个矩阵预留 4 个顶点属性

```cpp
// 顶点缓冲对象
unsigned int buffer;
glGenBuffers(1, &buffer);
glBindBuffer(GL_ARRAY_BUFFER, buffer);
glBufferData(GL_ARRAY_BUFFER, amount * sizeof(glm::mat4), &modelMatrices[0], GL_STATIC_DRAW);

for(unsigned int i = 0; i < rock.meshes.size(); i++)
{
    unsigned int VAO = rock.meshes[i].VAO;
    glBindVertexArray(VAO);
    // 顶点属性
    GLsizei vec4Size = sizeof(glm::vec4);
    glEnableVertexAttribArray(3);
    glVertexAttribPointer(3, 4, GL_FLOAT, GL_FALSE, 4 * vec4Size, (void*)0);
    glEnableVertexAttribArray(4);
    glVertexAttribPointer(4, 4, GL_FLOAT, GL_FALSE, 4 * vec4Size, (void*)(vec4Size));
    glEnableVertexAttribArray(5);
    glVertexAttribPointer(5, 4, GL_FLOAT, GL_FALSE, 4 * vec4Size, (void*)(2 * vec4Size));
    glEnableVertexAttribArray(6);
    glVertexAttribPointer(6, 4, GL_FLOAT, GL_FALSE, 4 * vec4Size, (void*)(3 * vec4Size));

    glVertexAttribDivisor(3, 1);	// 在渲染一个新实例的时候更新顶点属性
    glVertexAttribDivisor(4, 1);
    glVertexAttribDivisor(5, 1);
    glVertexAttribDivisor(6, 1);

    glBindVertexArray(0);
}
```

```cpp
// 绘制小行星
instanceShader.use();
for(unsigned int i = 0; i < rock.meshes.size(); i++)
{
    glBindVertexArray(rock.meshes[i].VAO);
    glDrawElementsInstanced(
        GL_TRIANGLES, rock.meshes[i].indices.size(), GL_UNSIGNED_INT, 0, amount
    );
}
```

![image-20220926155214705](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220926155214705.png)

### Anti Aliasing

#### 多重采样(Multisample Anti-aliasing, MSAA)

将单一的采样点变为多个采样点

![image-20220926205952840](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220926205952840.png)

![image-20220927101344024](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927101344024.png)

#### OpenGL 的 MSAA

要在 OpenGL 中使用 MSAA，必须要使用一个能在每个像素中存储大于 1 个颜色值的颜色缓冲（因为多重采样需要我们为每个采样点都储存一个颜色）

所以需要一个新的缓冲类型，来存储特定数量的多重采样样本，它叫做**多重采样缓冲(Multisample Buffer)。**

```cpp
glfwWindowHint(GLFW_SAMPLES, 4);
```

现在再调用`glfwCreateWindow`创建渲染窗口时，每个屏幕坐标就会使用一个包含 4 个子采样点的颜色缓冲

GLFW 会自动创建一个每像素 4 个子采样点的深度和样本缓冲，这也意味着所有缓冲的大小都增长为原来的 4 倍

```cpp
glEnable(GL_MULTISAMPLE);	// 默认启用
```

#### 离屏 MSAA

##### 多重采样纹理附件

为了创建一个支持储存多个采样点的纹理，使用`glTexImage2DMultisample`来替代`glTexImage2D`，它的纹理目标是`GL_TEXTURE_2D_MULTISAPLE`

```cpp
glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, tex);
glTexImage2DMultisample(GL_TEXTURE_2D_MULTISAMPLE, samples, GL_RGB, width, height, GL_TRUE);
glBindTexture(GL_TEXTURE_2D_MULTISAMPLE, 0);
```

第二个参数设置的是纹理所拥有的样本个数。

如果最后一个参数为`GL_TRUE`，图像将会对每个纹理元素使用相同的样本位置以及相同数量的子采样点个数。

```cpp
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D_MULTISAMPLE, tex, 0);
```

##### 多重采样渲染缓冲对象

将`glRenderbufferStorage`的调用改为`glRenderbufferStorageMultisample`

```cpp
glRenderbufferStorageMultisample(GL_RENDERBUFFER, 4, GL_DEPTH24_STENCIL8, width, height);
```

渲染缓冲对象后的参数我们将设定为样本的数量

##### 渲染到多重采样帧缓冲

一个多重采样的图像包含比普通图像更多的信息，我们所要做的是缩小或者还原(Resolve)图像

多重采样帧缓冲的还原通常是通过`glBlitFramebuffer`来完成，它能够将一个帧缓冲中的某个区域复制到另一个帧缓冲中，并且将多重采样缓冲还原

`glBlitFramebuffer`会将一个用 4 个屏幕空间坐标所定义的源区域复制到一个同样用 4 个屏幕空间坐标所定义的目标区域中

```cpp
glBindFramebuffer(GL_READ_FRAMEBUFFER, multisampledFBO);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0);
glBlitFramebuffer(0, 0, width, height, 0, 0, width, height, GL_COLOR_BUFFER_BIT, GL_NEAREST);
```

伪代码：

```cpp
unsigned int msFBO = CreateFBOWithMultiSampledAttachments();
// 使用普通的纹理颜色附件创建一个新的FBO
...
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, screenTexture, 0);
...
while(!glfwWindowShouldClose(window))
{
    ...

    glBindFramebuffer(msFBO);
    ClearFrameBuffer();
    DrawScene();
    // 将多重采样缓冲还原到中介FBO上
    glBindFramebuffer(GL_READ_FRAMEBUFFER, msFBO);
    glBindFramebuffer(GL_DRAW_FRAMEBUFFER, intermediateFBO);
    glBlitFramebuffer(0, 0, width, height, 0, 0, width, height, GL_COLOR_BUFFER_BIT, GL_NEAREST);
    // 现在场景是一个2D纹理缓冲，可以将这个图像用来后期处理
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    ClearFramebuffer();
    glBindTexture(GL_TEXTURE_2D, screenTexture);
    DrawPostProcessingQuad();

    ...
}
```

小结：

设置两个 framebuffer，一个用于 MSAA，另一个用于作为多重采样贴图转向普通贴图的中介

#### 自定义抗锯齿算法

将一个多重采样的纹理图像不进行还原直接传入着色器

要想获取每个子样本的颜色值，需要将纹理 uniform 采样器设置为`sampler2DMS`，而不是`sampler2D`

```cpp
uniform sampler2DMS screenTextureMS;
```

使用`texelFetch`函数就能够获取每个子样本的颜色值了

```cpp
vec4 colorSample = texelFetch(screenTextureMS, TexCoords, 3);  // 第4个子样本
```

## Advanced Lighting

### Advanced Lighting

#### Blinn-Phong

冯氏模型的不足：

当观察向量与反射光向量的夹角大于 90° 时，根据公式反射分量为 0，但当照射面的反光度非常小时，它产生的镜面高光半径足以让这些相反方向的光线对亮度产生足够大的影响，因而就不能轻易忽略它们的影响

![image-20220927133637387](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927133637387.png)

Blinn-Phong 模型在冯氏模型的基础上引入了半程向量

![image-20220927133909814](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927133909814.png)

现在，不论观察者向哪个方向看，半程向量与表面法线之间的夹角都不会超过 90 度（除非光源在表面以下）

$$
\bar{H} = \frac{\bar{L} + \bar{V}}{||\bar{L} + \bar{V}||}
$$

```cpp
vec3 lightDir   = normalize(lightPos - FragPos);
vec3 viewDir    = normalize(viewPos - FragPos);
vec3 halfwayDir = normalize(lightDir + viewDir);
```

```cpp
float spec = pow(max(dot(normal, halfwayDir), 0.0), shininess);
vec3 specular = lightColor * spec;
```

在引入半程向量之后，现在就不会再看到冯氏光照中高光断层的情况了。下面两个图片展示的是两种方法在镜面光分量为 0.5 时的对比：

![image-20220927134218929](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927134218929.png)

除此之外，冯氏模型与 Blinn-Phong 模型也有一些细微的差别：**半程向量与表面法线的夹角通常会小于观察与反射向量的夹角**

所以，如果想获得和冯氏着色类似的效果，就必须在使用 Blinn-Phong 模型时将镜面反光度设置更高一点

通常会选择冯氏着色时反光度分量的 2 到 4 倍。

冯氏着色反光度为 8.0，Blinn-Phong 着色反光度为 32.0 时的一个对比：

![image-20220927134431240](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927134431240.png)

```cpp
void main()
{
    [...]
    float spec = 0.0;
    if(blinn)
    {
        vec3 halfwayDir = normalize(lightDir + viewDir);
        spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
    }
    else
    {
        vec3 reflectDir = reflect(-lightDir, normal);
        spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
    }
```

### Gamma Correction

过去，大多数监视器是阴极射线管显示器（CRT）

这些监视器有一个物理特性就是两倍的输入电压产生的不是两倍的亮度。输入电压产生约为输入电压的 2.2 次幂的亮度，这叫做监视器 Gamma。

**Gamma 也叫灰度系数**，每种显示设备都有自己的 Gamma 值

设备输出亮度 = 电压的 Gamma 次幂

任何设备 Gamma 基本上都不会等于 1，等于 1 是一种理想的线性状态，即输入 == 输出

对于 CRT，Gamma 通常为 2.2，即输出亮度 = 输入电压的 2.2 次幂，这是由于 Gamma 为 2.2 时显示的图像符合人眼习惯（人对暗环境下的亮度变化更为敏感），因而 2.2 也成为了 sRGB 的 Gamma 值

![image-20220927154239503](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927154239503.png)

![image-20220927160409182](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927160409182.png)

由图可得，点线是 Gamma=1 的理想状况，此时输入=输出，而在 CRT 的曲线中，输出要小于输入，例如（0.5 -> 0.218），当理想状态下光亮翻倍时，在 CRT 显示器上的实际亮度翻了约 4.5 倍

因此，**为了让计算的亮度与实际显示的亮度保持一致，引入了 gamma 矫正**

![image-20220927160745414](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927160745414.png)

#### Gamma 校正

其原理为，先对理想状况下的亮度求 Gamma 的倒数的幂次，可以理解为提亮

$$
(0.5, 0.0, 0.0)^{1/2.2} = (0.5, 0.0, 0.0)^{0.45} = (0.73, 0.0, 0.0)
$$

随后校正后的颜色发送给显示器，显示器的亮度值为输入值的 Gamma 次幂，此时刚好与矫正的幂次中和，进而使输出值与线性状况的计算值保持一致

$$
(0.73, 0.0, 0.0)^{2.2} = (0.5, 0.0, 0.0)
$$

有两种应用 gamma 矫正的方式：

- 开启 GL_FRAMEBUFFER_SRGB，每次像素着色器运行后续帧缓冲，OpenGL 将自动执行 gamma 校正，包括默认帧缓冲

  ```
  glEnable(GL_FRAMEBUFFER_SRGB);
  ```

  注意：应在数据发送给显示器前的最后一步执行 gamma 矫正，因为矫正会将线性空间转换为非线性的。若在之前就执行矫正，后续操作的颜色值将都是不正确的

- 在每个片段着色器的最后应用 gamma 矫正

  ```cpp
  void main()
  {
      // do super fancy lighting
      [...]
      // apply gamma correction
      float gamma = 2.2;
      fragColor.rgb = pow(fragColor.rgb, vec3(1.0/gamma));
  }
  ```

  注意：当有多个着色器时，为了避免重复编辑的麻烦，可利用帧缓冲，仅对最终的四边形图像进行 gamma 矫正

#### sRGB 纹理

![image-20220927162231430](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927162231430.png)

基于监视器上看到的情况创建一个图像，我们已经对颜色值进行了 gamma 校正

而在渲染中又进行了一次 gamma 校正，导致进行了两次校正

```cpp
glTexImage2D(GL_TEXTURE_2D, 0, GL_SRGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, image);
```

使用 GL_SRGB，OpenGL 将自动把颜色校正到线性空间中，这样所使用的所有颜色值都是在线性空间

因为不是所有纹理都是在 sRGB 空间中的所以当把纹理指定为 sRGB 纹理时要格外小心

比如 diffuse 纹理，这种为物体上色的纹理几乎都是在 sRGB 空间中的

而为了获取光照参数的纹理，像 specular 贴图和法线贴图几乎都在线性空间中

#### 衰减

使用二次的衰减在校正后往往会显得衰减过强，不用时反而显得真实

```cpp
float attenuation = 1.0 / (distance * distance);
```

使用双曲线的衰减在不使用 gamma 矫正时更真实，但使用之后会衰弱不足

```cpp
float attenuation = 1.0 / distance;
```

![image-20220927163432780](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220927163432780.png)

这是因为，对于二次衰减，若不使用 gamma 矫正，分母的幂次将变得很大，导致衰减剧烈

$$
(1.0 / distance^2)^{2.2}
$$

而双曲线衰减，在不进行矫正时，其结果和物理公式近似，反而贴合结果

$$
(1.0 / distance)^{2.2} = 1.0 / distance^{2.2}
$$

因此，在监视器上效果最好的衰减方程，并不是符合物理的

### Shadow Mapping

#### 阴影映射

![image-20220929104728189](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929104728189.png)

从光源的透视图来渲染场景，并把深度值的结果储存到纹理

我们管储存在纹理中的所有这些深度值，叫做深度贴图（depth map）或阴影贴图。

![image-20220929105017183](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929105017183.png)

左侧的图片展示了一个定向光源（所有光线都是平行的）下立方体投射的阴影。通过储存到深度贴图中的深度值，我们就能找到最近点，用以决定片段是否在阴影中。

我们使用一个来自光源的视图和投影矩阵来渲染场景就能创建一个深度贴图。这个投影和视图矩阵结合在一起成为一个 T 变换，它可以将任何三维位置转变到光源的可见坐标空间。

![image-20220929105809170](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929105809170.png)

#### 深度贴图

利用帧缓冲，将深度绘制到纹理上

```cpp
GLuint depthMapFBO;
glGenFramebuffers(1, &depthMapFBO);
```

```cpp
const GLuint SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;	//深度贴图的分辨率

GLuint depthMap;
glGenTextures(1, &depthMap);
glBindTexture(GL_TEXTURE_2D, depthMap);
glTexImage2D(GL_TEXTURE_2D, 0, GL_DEPTH_COMPONENT, 		// 贴图类型
             SHADOW_WIDTH, SHADOW_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_TEXTURE_2D, depthMap, 0);
glDrawBuffer(GL_NONE);		// 显式声明不使用颜色数据进行渲染
glReadBuffer(GL_NONE);		// 显式声明不使用颜色数据进行渲染
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

渲染过程中，先渲染到帧缓冲的深度贴图里，再渲染到屏幕上

```cpp
// 1. 首选渲染深度贴图
glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glClear(GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
RenderScene();
glBindFramebuffer(GL_FRAMEBUFFER, 0);
// 2. 像往常一样渲染场景，但这次使用深度贴图
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
glBindTexture(GL_TEXTURE_2D, depthMap);
RenderScene();
```

#### 光源空间的变换

案例采用平行光，使用正交投影

```cpp
GLfloat near_plane = 1.0f, far_plane = 7.5f;
glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);
```

```cpp
glm::mat4 lightView = glm::lookAt(glm::vec(-2.0f, 4.0f, -1.0f), glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(0.0f, 1.0f, 0.0f));
```

```cpp
glm::mat4 lightSpaceMatrix = lightProjection * lightView;
```

#### 渲染至深度贴图

普通着色器是将局部坐标转换为视图坐标，即相机出发

深度贴图的顶点着色将局部坐标转换为从光源出发的坐标

```cpp
#version 330 core
layout (location = 0) in vec3 position;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(position, 1.0f);
}
```

不使用颜色缓冲，片段着色器为空

```cpp
#version 330 core

void main()
{
    // gl_FragDepth = gl_FragCoord.z;
}
```

若改用透视投影

```cpp
// required when using a perspective projection matrix
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // Back to NDC
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

void main()
{
    float depthValue = texture(depthMap, TexCoords).r;
    // FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective
    FragColor = vec4(vec3(depthValue), 1.0); // orthographic
}
```

#### 渲染阴影

另实例一个 shader，以物体的材质和阴影贴图为 texture，根据下述函数进行比较是否在阴影中

注意，函数中需要手动进行透视除法，因为顶点着色器只会对`gl_Position`自动进行透视除法，随后还需将 NDC 变换到[0,1]的范围，因为贴图是[0,1]范围取值的

```cpp
float ShadowCalculation(vec4 fragPosLightSpace)
{
    // 执行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    // 变换到[0,1]的范围
    projCoords = projCoords * 0.5 + 0.5;
    // 取得最近点的深度(使用[0,1]范围下的fragPosLight当坐标)
    float closestDepth = texture(shadowMap, projCoords.xy).r;
    // 取得当前片段在光源视角下的深度
    float currentDepth = projCoords.z;
    // 检查当前片段是否在阴影中
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;

    return shadow;
}
```

```cpp
#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} fs_in;

uniform sampler2D diffuseTexture;
uniform sampler2D shadowMap;

uniform vec3 lightPos;
uniform vec3 viewPos;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    [...]
}

void main()
{
    vec3 color = texture(diffuseTexture, fs_in.TexCoords).rgb;
    vec3 normal = normalize(fs_in.Normal);
    vec3 lightColor = vec3(1.0);
    // Ambient
    vec3 ambient = 0.15 * color;
    // Diffuse
    vec3 lightDir = normalize(lightPos - fs_in.FragPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * lightColor;
    // Specular
    vec3 viewDir = normalize(viewPos - fs_in.FragPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = 0.0;
    vec3 halfwayDir = normalize(lightDir + viewDir);
    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
    vec3 specular = spec * lightColor;
    // 计算阴影
    float shadow = ShadowCalculation(fs_in.FragPosLightSpace);
    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;

    FragColor = vec4(lighting, 1.0f);
}
```

#### 阴影失真

由结果发现，渲染后的材质具有间隔的黑色条纹，这种不真实感叫阴影失真

![image-20220929142330855](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929142330855.png)

由于阴影贴图受限于分辨率，在距离光源比较远的情况下，多个片段可能从深度贴图的同一个值中去采样

图片每个斜坡代表深度贴图一个单独的纹理像素，可以看到，多个片段从同一个深度值进行采样

采样斜坡有的在地面下，有的在地面上，当光源的入射角度一致时，所得到的阴影就有了差异

![image-20220929142430071](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929142430071.png)

可以采用**阴影偏移**（shadow bias）的技巧来解决这个问题

![image-20220929142633451](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929142633451.png)

```cpp
float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
```

取一个最大值 0.05 和最小值 0.005 的偏移量，用于应对不同的表面与光线的接触情况

PS：也可换种理解方法，假设光线是由一个与其垂直的光平面照射出的，光线倾斜照射到一个深度段的中点，那么，该深度段的深度就是它与光平面之间的距离 a，但由于光是倾斜入射到深度段上的，这意味着深度段上必然有一部分距离光平面的距离大于 a，导致该部分被视为了阴影部分

#### 悬浮

当偏移量较大时，阴影与物体位置会存在一个偏移，造成悬浮感

![image-20220929143100384](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929143100384.png)

learnopengl 提到可以使用正面剔除的方法来克服悬浮，其本质原理是让条纹生成在物体内部，从而可以不使用偏移，也就避免了悬浮

![image-20220929144841247](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929144841247.png)

#### 采样过多

由于视锥具有一个范围，当超出视锥时，其 z 值大于[0,1]的范围，为此可设置一个默认值

```cpp
if(projCoords.z > 1.0) shadow = 0.0; // 表示视锥范围外的不产生阴影
```

#### PCF（percentage-closer filtering）

当深度贴图的分辨率较低时，锯齿边会很明显

PCF 的核心思想是从深度贴图中多次采样，每一次采样的纹理坐标都稍有不同。每个独立的样本可能在也可能不再阴影中。所有的次生结果接着结合在一起，进行平均化，我们就得到了柔和阴影。即卷积

```cpp
float shadow = 0.0;
vec2 texelSize = 1.0 / textureSize(shadowMap, 0);
for(int x = -1; x <= 1; ++x)
{
    for(int y = -1; y <= 1; ++y)
    {
        float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
        shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
    }
}
shadow /= 9.0;
```

#### 正交 vs 投影

正交投影矩阵并不会将场景用透视图进行变形，所有视线/光线都是平行的，这使它对于定向光来说是个很好的投影矩阵

而透视投影矩阵，会将所有顶点根据透视关系进行变形，透视投影对于光源来说更合理

透视投影因此更经常用在点光源和聚光灯上，而正交投影经常用在定向光上

下图展示了两种投影方式所产生的不同阴影区域：

![image-20220929150430764](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929150430764.png)

### Point Shadows

点光源需要渲染所有场景的深度贴图，因而需要采用立方体贴图

![image-20220929153047957](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220929153047957.png)

#### 生成深度立方体贴图

最直白的方法：渲染场景 6 次，每次把一个不同的立方体贴图面附加到帧缓冲对象上

```cpp
for(int i = 0; i < 6; i++)
{
    GLuint face = GL_TEXTURE_CUBE_MAP_POSITIVE_X + i;
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, face, depthCubemap, 0);
    BindViewMatrix(lightViewMatrices[i]);
    RenderScene();
}
```

为了避免渲染六次场景带来的损耗，采用几何着色器来生成深度立方体贴图

```cpp
GLuint depthCubemap;
glGenTextures(1, &depthCubemap);
```

然后生成立方体贴图的每个面，将它们作为 2D 深度值纹理图像：

```cpp
const GLuint SHADOW_WIDTH = 1024, SHADOW_HEIGHT = 1024;
glBindTexture(GL_TEXTURE_CUBE_MAP, depthCubemap);
for (GLuint i = 0; i < 6; ++i)
    glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_DEPTH_COMPONENT,
         SHADOW_WIDTH, SHADOW_HEIGHT, 0, GL_DEPTH_COMPONENT, GL_FLOAT, NULL);
```

```cpp
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
```

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glFramebufferTexture(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, depthCubemap, 0);
glDrawBuffer(GL_NONE);
glReadBuffer(GL_NONE);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

万向阴影贴图有两个渲染阶段：首先我们生成深度贴图，然后我们正常使用深度贴图渲染，在场景中创建阴影。

```cpp
// 1. first render to depth cubemap
glViewport(0, 0, SHADOW_WIDTH, SHADOW_HEIGHT);
glBindFramebuffer(GL_FRAMEBUFFER, depthMapFBO);
glClear(GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
RenderScene();
glBindFramebuffer(GL_FRAMEBUFFER, 0);
// 2. then render scene as normal with shadow mapping (using depth cubemap)
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
ConfigureShaderAndMatrices();
glBindTexture(GL_TEXTURE_CUBE_MAP, depthCubemap);
RenderScene();
```

#### 光空间的变换

每个光空间的变换矩阵包含了投影和视图矩阵

对于投影矩阵来说，我们将使用一个相同的透视投影矩阵

```cpp
GLfloat aspect = (GLfloat)SHADOW_WIDTH/(GLfloat)SHADOW_HEIGHT;
GLfloat near = 1.0f;
GLfloat far = 25.0f;
glm::mat4 shadowProj = glm::perspective(glm::radians(90.0f), aspect, near, far);
// 90.0°确保填满整个空间
```

用`glm::lookAt`创建 6 个观察方向，每个都按顺序注视着立方体贴图的的一个方向：右、左、上、下、近、远：

```cpp
std::vector<glm::mat4> shadowTransforms;
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(1.0,0.0,0.0), glm::vec3(0.0,-1.0,0.0));
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(-1.0,0.0,0.0), glm::vec3(0.0,-1.0,0.0));
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(0.0,1.0,0.0), glm::vec3(0.0,0.0,1.0));
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(0.0,-1.0,0.0), glm::vec3(0.0,0.0,-1.0));
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(0.0,0.0,1.0), glm::vec3(0.0,-1.0,0.0));
shadowTransforms.push_back(shadowProj *
                 glm::lookAt(lightPos, lightPos + glm::vec3(0.0,0.0,-1.0), glm::vec3(0.0,-1.0,0.0));
```

#### 深度着色器

顶点着色器将点转换为世界坐标传输给几何着色器

```cpp
// vertex
#version 330 core
layout (location = 0) in vec3 position;

uniform mat4 model;

void main()
{
    gl_Position = model * vec4(position, 1.0);
}
```

几何着色器输入三角形，对三角形各个点通过变换矩阵变换到光空间下的六个面上

```cpp
// geometry
#version 330 core
layout (triangles) in;
layout (triangle_strip, max_vertices=18) out;

uniform mat4 shadowMatrices[6];

out vec4 FragPos; // FragPos from GS (output per emitvertex)

void main()
{
    for(int face = 0; face < 6; ++face)
    {
        gl_Layer = face; // built-in variable that specifies to which face we render.
        for(int i = 0; i < 3; ++i) // for each triangle's vertices
        {
            FragPos = gl_in[i].gl_Position;
            gl_Position = shadowMatrices[face] * FragPos;
            EmitVertex();
        }
        EndPrimitive();
    }
}
```

片段着色器则分别计算各个片段到光源的距离，并归一化保存到深度值中

```cpp
// fragment
#version 330 core
in vec4 FragPos;

uniform vec3 lightPos;
uniform float far_plane;

void main()
{
    // get distance between fragment and light source
    float lightDistance = length(FragPos.xyz - lightPos);

    // map to [0;1] range by dividing by far_plane
    lightDistance = lightDistance / far_plane;

    // write this as modified depth
    gl_FragDepth = lightDistance;
}
```

#### 万向阴影贴图

```cpp
glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shader.Use();
// ... send uniforms to shader (including light's far_plane value)
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_CUBE_MAP, depthCubemap);
// ... bind other textures
RenderScene();
```

立方体深度贴图的使用不同于 2D 的深度贴图

在 2D 贴图中需要将目标`fragPos`变换到光空间中，即`FragPosLightSpace`，供片段着色器进行二维采样

在立方体贴图，则不需要该变换，直接使用`fragPos`与`lightPos`之间生成的向量在立方体贴图上采样即可

```cpp
float ShadowCalculation(vec3 fragPos)
{
    // Get vector between fragment position and light position
    vec3 fragToLight = fragPos - lightPos;
    // Use the light to fragment vector to sample from the depth map
    float closestDepth = texture(depthMap, fragToLight).r;
    // It is currently in linear range between [0,1]. Re-transform back to original value
    closestDepth *= far_plane;
    // Now get current linear depth as the length between the fragment and light position
    float currentDepth = length(fragToLight);
    // Now test for shadows
    float bias = 0.05;
    float shadow = currentDepth -  bias > closestDepth ? 1.0 : 0.0;

    return shadow;
}
```

其他计算和平行光的保持一致

#### 显示立方体贴图深度缓冲

在`ShadowCalculation`函数中，把`FragColor`改为如下

```cpp
FragColor = vec4(vec3(closestDepth / far_plane), 1.0);
```

![image-20220930094200487](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930094200487.png)

#### PCF

可使用类似于 2D 的方法进行滤波，但采样点可能过多造成性能的损耗

```cpp
float shadow = 0.0;
float bias = 0.05;
float samples = 4.0;
float offset = 0.1;
for(float x = -offset; x < offset; x += offset / (samples * 0.5))
{
    for(float y = -offset; y < offset; y += offset / (samples * 0.5))
    {
        for(float z = -offset; z < offset; z += offset / (samples * 0.5))
        {
            float closestDepth = texture(depthMap, fragToLight + vec3(x, y, z)).r;
            closestDepth *= far_plane;   // Undo mapping [0;1]
            if(currentDepth - bias > closestDepth)
                shadow += 1.0;
        }
    }
}
shadow /= (samples * samples * samples);
```

因而引入一个偏移量方向数组，剔除彼此接近的方向

```cpp
vec3 sampleOffsetDirections[20] = vec3[]
(
   vec3( 1,  1,  1), vec3( 1, -1,  1), vec3(-1, -1,  1), vec3(-1,  1,  1),
   vec3( 1,  1, -1), vec3( 1, -1, -1), vec3(-1, -1, -1), vec3(-1,  1, -1),
   vec3( 1,  1,  0), vec3( 1, -1,  0), vec3(-1, -1,  0), vec3(-1,  1,  0),
   vec3( 1,  0,  1), vec3(-1,  0,  1), vec3( 1,  0, -1), vec3(-1,  0, -1),
   vec3( 0,  1,  1), vec3( 0, -1,  1), vec3( 0, -1, -1), vec3( 0,  1, -1)
);

float shadow = 0.0;
float bias = 0.15;
int samples = 20;
float viewDistance = length(viewPos - fragPos);
float diskRadius = 0.05;
for(int i = 0; i < samples; ++i)
{
    float closestDepth = texture(depthMap, fragToLight + sampleOffsetDirections[i] * diskRadius).r;
    closestDepth *= far_plane;   // Undo mapping [0;1]
    if(currentDepth - bias > closestDepth)
        shadow += 1.0;
}
shadow /= float(samples);
```

同时还可以使 diskRadius 随着观察距离进行变动

```cpp
float diskRadius = (1.0 + (viewDistance / far_plane)) / 25.0;
```

#### PS：渲染六个场景的方式未必就比使用几何着色器的缓慢，这取决于环境类型

### Normal Mapping

真实物体的表面并非是平坦的，而物体表面被照亮的方式是由该表面的法线所决定的

当各个片段的法线方向一致时，就造成了平坦的现象，因此只要使各个片段有着各自不同的法线，便可实现凹凸的感受

这种每个`fragment`使用各自的法线，替代一个面上所有`fragment`使用同一个法线的技术叫做**法线贴图（normal mapping）或凹凸贴图（bump mapping）**

![image-20220930101601909](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930101601909.png)

![image-20220930101610248](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930101610248.png)

#### 法线贴图

2D 纹理同样可以用来储存法线数据

纹理通常是用于储存颜色信息，而法线向量是个几何工具，但是颜色的 rgb 元素所代表的 3D 向量刚好和法线向量的 xyz 形式近似，因此**可以将法线向量的 x、y、z 元素储存到纹理中，代替颜色的 r、g、b 元素**

法线向量的范围在-1 到 1 之间，所以我们先要将其映射到 0 到 1 的范围：

```cpp
vec3 rgb_normal = normal * 0.5 + 0.5; // 从 [-1,1] 转换至 [0,1]
```

![img](https://learnopengl-cn.github.io/img/05/04/normal_mapping_normal_map.png)

这会是一种偏蓝色调的纹理（网上找到的几乎所有法线贴图都是这样的）

这是因为所有法线的指向都偏向 z 轴（0, 0, 1），这是一种偏蓝的颜色

法线向量从 z 轴方向也向其他方向轻微偏移，颜色也就发生了轻微变化，这样看起来便有了一种深度

例如，可以看到在每个砖块的顶部，颜色倾向于偏绿，这是因为砖块的顶部的法线偏向于指向正 y 轴方向（0, 1, 0），这样它就是绿色的了

##### 法线贴图的难点

同一张法线贴图的向量方向是固定的，若应用于不同朝向的表面，将会导致法线向量的错误

![image-20220930104025444](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930104025444.png)

![image-20220930104039944](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930104039944.png)

#### 切线空间（tangent space）

法线贴图中的法线向量定义在切线空间中，在切线空间中，法线永远指着正 z 方向

切线空间就像法线贴图向量的本地空间，它们都被定义为指向正 z 方向，在使用一个特定的矩阵就能将切线空间中的法线向量转换成世界或视图空间下

**这种矩阵叫做 TBN 矩阵这三个字母分别代表 tangent、bitangent 和 normal 向量**

它们相互垂直，沿表面的法线贴图对齐于：上、右、前

上向量是表面的法线向量 N，右和前向量是切线 T(Tagent)和副切线 B(Bitangent)向量

![image-20220930104650263](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930104650263.png)

##### 计算切线 T 和副切线 B

![image-20220930104856286](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930104856286.png)

$$
E_1 = \Delta U_1T + \Delta V_1B \\
E_2 = \Delta U_2T + \Delta V_2B
$$

也可写成

$$
(E_{1x}, E_{1y}, E_{1z}) = \Delta U_1(T_x, T_y, T_z) + \Delta V_1(B_x, B_y, B_z) \\
(E_{2x}, E_{2y}, E_{2z}) = \Delta U_2(T_x, T_y, T_z) + \Delta V_2(B_x, B_y, B_z)
$$

采用矩阵乘法形式

$$
\begin{bmatrix} E_{1x} & E_{1y} & E_{1z} \\ E_{2x} & E_{2y} & E_{2z} \end{bmatrix} = \begin{bmatrix} \Delta U_1 & \Delta V_1 \\ \Delta U_2 & \Delta V_2 \end{bmatrix} \begin{bmatrix} T_x & T_y & T_z \\ B_x & B_y & B_z \end{bmatrix}
$$

两边左乘 ΔUΔV 的逆矩阵

$$
\begin{bmatrix} \Delta U_1 & \Delta V_1 \\ \Delta U_2 & \Delta V_2 \end{bmatrix}^{-1} \begin{bmatrix} E_{1x} & E_{1y} & E_{1z} \\ E_{2x} & E_{2y} & E_{2z} \end{bmatrix} = \begin{bmatrix} T_x & T_y & T_z \\ B_x & B_y & B_z \end{bmatrix}
$$

由于

$$
A^{-1} = \frac{A^*} {|A|}
$$

则

$$
\begin{bmatrix} T_x & T_y & T_z \\ B_x & B_y & B_z \end{bmatrix}  = \frac{1}{\Delta U_1 \Delta V_2 - \Delta U_2 \Delta V_1} \begin{bmatrix} \Delta V_2 & -\Delta V_1 \\ -\Delta U_2 & \Delta U_1 \end{bmatrix} \begin{bmatrix} E_{1x} & E_{1y} & E_{1z} \\ E_{2x} & E_{2y} & E_{2z} \end{bmatrix}
$$

#### 手工计算切线和副切线

点、纹理坐标、法线

```cpp
// positions
glm::vec3 pos1(-1.0,  1.0, 0.0);
glm::vec3 pos2(-1.0, -1.0, 0.0);
glm::vec3 pos3(1.0, -1.0, 0.0);
glm::vec3 pos4(1.0, 1.0, 0.0);
// texture coordinates
glm::vec2 uv1(0.0, 1.0);
glm::vec2 uv2(0.0, 0.0);
glm::vec2 uv3(1.0, 0.0);
glm::vec2 uv4(1.0, 1.0);
// normal vector
glm::vec3 nm(0.0, 0.0, 1.0);
```

计算边向量

```cpp
glm::vec3 edge1 = pos2 - pos1;
glm::vec3 edge2 = pos3 - pos1;
glm::vec2 deltaUV1 = uv2 - uv1;
glm::vec2 deltaUV2 = uv3 - uv1;
```

利用上述公式计算切线和副切线，其中.x 代表 U，.y 代表 V

```cpp
GLfloat f = 1.0f / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

tangent1.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
tangent1.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
tangent1.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
tangent1 = glm::normalize(tangent1);

bitangent1.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
bitangent1.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
bitangent1.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
bitangent1 = glm::normalize(bitangent1);

[...] // 对平面的第二个三角形采用类似步骤计算切线和副切线
```

![image-20220930111338454](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930111338454.png)

#### 切线空间法线贴图

```cpp
// vertex
#version 330 core
layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 texCoords;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 bitangent;

void main()
{
   [...]
   vec3 T = normalize(vec3(model * vec4(tangent,   0.0)));
   vec3 B = normalize(vec3(model * vec4(bitangent, 0.0)));	// 也可使用cross（T, N）获得
   vec3 N = normalize(vec3(model * vec4(normal,    0.0)));
   mat3 TBN = mat3(T, B, N)
}
```

使用 TBN 的两种方式

1. 直接使用 TBN 矩阵，这个矩阵可以把切线坐标空间的向量转换到世界坐标空间。因此把它传给片段着色器中，把通过采样得到的法线坐标左乘上 TBN 矩阵，转换到世界坐标空间中，这样所有法线和其他光照变量就在同一个坐标系中了。
2. 使用 TBN 矩阵的逆矩阵，这个矩阵可以把世界坐标空间的向量转换到切线坐标空间。因此使用这个矩阵左乘其他光照变量，把他们转换到切线空间，这样法线和其他光照变量再一次在一个坐标系中了。

##### 方法一：将 TBN 传入片段着色器，将法线从切线空间转换到世界空间

```cpp
// fragment
in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    mat3 TBN;
} fs_in;

normal = texture(normalMap, fs_in.TexCoords).rgb;	// 取法线值
normal = normalize(normal * 2.0 - 1.0);   			// 转换回[-1,1]范围
normal = normalize(fs_in.TBN * normal);				// 转换到世界空间
```

##### 方法二：用 TBN 逆矩阵将所有世界空间向量转换到切线空间

```cpp
// vertex
vs_out.TBN = transpose(mat3(T, B, N));				//正交矩阵的逆矩阵就是它的转置矩阵

// fragment
void main()
{
    vec3 normal = texture(normalMap, fs_in.TexCoords).rgb;
    normal = normalize(normal * 2.0 - 1.0);

    vec3 lightDir = fs_in.TBN * normalize(lightPos - fs_in.FragPos);	//转到切线空间
    vec3 viewDir  = fs_in.TBN * normalize(viewPos - fs_in.FragPos);    	//转到切线空间
    [...]
}
```

##### PS：方法二需要转换的向量更多，为什么要使用方法二呢

这是因为鉴于方法二的思路，可以直接在顶点着色器中就将相关向量转换到切线空间，从而避免了片段着色器进行此类行为，而方法一是无法避免的

换言之，现在不是把 TBN 矩阵的逆矩阵发送给像素着色器，而是将切线空间的光源位置，观察位置以及顶点位置发送给像素着色器

通常顶点着色器运行的比片段着色器要少，因而这是种优化

```cpp
// vertex
out VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} vs_out;

uniform vec3 lightPos;
uniform vec3 viewPos;

[...]

void main()
{
    [...]
    mat3 TBN = transpose(mat3(T, B, N));
    vs_out.TangentLightPos = TBN * lightPos;
    vs_out.TangentViewPos  = TBN * viewPos;
    vs_out.TangentFragPos  = TBN * vec3(model * vec4(position, 0.0));
}
```

#### 复杂物体

Assimp 在`ReadFile`调用`aiProcess_CalcTangentSpace`，Assimp 会为每个加载的顶点计算出柔和的切线和副切线向量

```cpp
const aiScene* scene = importer.ReadFile(
    path, aiProcess_Triangulate | aiProcess_FlipUVs | aiProcess_CalcTangentSpace
);
```

```cpp
vector.x = mesh->mTangents[i].x;
vector.y = mesh->mTangents[i].y;
vector.z = mesh->mTangents[i].z;
vertex.Tangent = vector;
```

然后，还必须更新模型加载器，用以从带纹理模型中加载法线贴图

wavefront 的模型格式（.obj）导出的法线贴图有点不一样，Assimp 的`aiTextureType_NORMAL`并不会加载它的法线贴图，而`aiTextureType_HEIGHT`却能，所以我们经常这样加载它们：

```cpp
vector<Texture> specularMaps = this->loadMaterialTextures(
    material, aiTextureType_HEIGHT, "texture_normal"
);
```

使用了法线贴图我们可以使用更少的顶点表现出同样丰富的细节

![image-20220930151502572](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930151502572.png)

#### 施密特正交化

在更大的网格计算切线向量时，往往有着大量的共享顶点，当法向贴图应用到这些表面时将切线向量平均化通常能获得更好更平滑的结果

但代价是 TBN 向量可能会不能互相垂直，这意味着 TBN 矩阵不再是正交矩阵了

为此采用施密特正交化，重新矫正 TBN

```cpp
vec3 T = normalize(vec3(model * vec4(tangent, 0.0)));
vec3 N = normalize(vec3(model * vec4(normal, 0.0)));
// re-orthogonalize T with respect to N
T = normalize(T - dot(T, N) * N);
// then retrieve perpendicular vector B with the cross product of T and N
vec3 B = cross(T, N);

mat3 TBN = mat3(T, B, N)
```

### Parallax Mapping 视差贴图

利用视错觉，对深度有着更好的表达

视差贴图属于位移贴图(Displacement Mapping)技术的一种，它对根据储存在纹理中的几何信息对顶点进行位移或偏移

一种实现的方式是比如有 1000 个顶点，根据纹理中的数据对平面特定区域的顶点的高度进行位移。这样的每个纹理像素包含了高度值纹理叫做高度贴图。

一张简单的砖块表面的高度贴图如下所示：

![img](https://learnopengl-cn.github.io/img/05/05/parallax_mapping_height_map.png)

![image-20220930152527328](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930152527328.png)

置换顶点有一个问题就是平面必须由很多顶点组成才能获得具有真实感的效果，否则看起来效果并不会很好

视差贴图使得可以仅用较少的点就获得欺骗性的视觉效果

![Diagram of how parallax mapping works in OpenGL](https://learnopengl.com/img/advanced-lighting/parallax_mapping_plane_height.png)

图中红色的线代表高度贴图中砖的几何表示，向量 V 是 viewDir，如果平面有实际的移动，则人眼对 A 点的观测结果显示如 B 点，但实际上 A 点并没移动

![Diagram of how parallax mapping works in OpenGL with vector scaled by fragment's height.](https://learnopengl.com/img/advanced-lighting/parallax_mapping_scaled_height.png)

视差贴图采用的方法是 scale 向量 V 的大小，使它等于 A 点处的高度值 H（A），即向量 P，随后通过向量 P 与平面平行的偏移量作为坐标读取高度 H（P），大多数情况该值与 B 临近

![Diagram of why basic parallax mapping gives incorrect result at steep height changes.](https://learnopengl.com/img/advanced-lighting/parallax_mapping_incorrect_p.png)

有个问题是，该方法存在缺陷，即急剧变化的部分采样值与实际效果并不贴合

另一个问题是和法线贴图一样，当物体移动时，贴图将难以契合

#### 视差贴图

相较于模拟高度，模拟深度会更为容易，因而可将高度贴图改用为深度贴图

<img src="https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/bricks2_disp.jpg" alt="bricks2_disp" style="zoom: 50%;" />

此时用向量 V 减去 A 的纹理坐标获得向量 P 的位置

![parallax_mapping_depth](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/parallax_mapping_depth.png)

在顶点着色器中，与法线贴图的保持一致，对需要的向量转换为切线空间输送给片段着色器

```cpp
#version 330 core
out vec4 FragColor;

in VS_OUT {
    vec3 FragPos;
    vec2 TexCoords;
    vec3 TangentLightPos;
    vec3 TangentViewPos;
    vec3 TangentFragPos;
} fs_in;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D depthMap;

uniform float height_scale;

vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir);

void main()
{
    // Offset texture coordinates with Parallax Mapping
    vec3 viewDir   = normalize(fs_in.TangentViewPos - fs_in.TangentFragPos);
    vec2 texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);

    // then sample textures with new texture coords
    vec3 diffuse = texture(diffuseMap, texCoords);
    vec3 normal  = texture(normalMap, texCoords);
    normal = normalize(normal * 2.0 - 1.0);
    // proceed with lighting code
    [...]
}
```

其中 `ParallaxMapping` 函数将输入的纹理转换为根据深度贴图调整后的纹理

```cpp
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{
    float height =  texture(depthMap, texCoords).r;    // 通过A点原坐标采样获得H(A)
    vec2 p = viewDir.xy / viewDir.z * (height * height_scale);	// 进行scale
    return texCoords - p;    // 减去向量P获得为以后的坐标
}
```

其中`viewDir.xy / viewDir.z`，是因为 viewDir 向量是经过了标准化的，viewDir.z 会在 0.0 到 1.0 之间的某处

当`viewDir`大致平行于表面时，它的 z 元素接近于 0.0，除法会返回比 viewDir 垂直于表面的时候更大的 P 向量

所以，从本质上，相比正朝向表面，当带有角度地看向平面时，我们会更大程度地缩放 P 的大小，从而增加纹理坐标的偏移，进而在视角上会获得更大的真实度

![image-20220930162150181](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930162150181.png)

同时，对于边缘，为了避免纹理坐标对超出范围的部分进行错误采样，应丢弃这些片段

```cpp
texCoords = ParallaxMapping(fs_in.TexCoords,  viewDir);
if(texCoords.x > 1.0 || texCoords.y > 1.0 || texCoords.x < 0.0 || texCoords.y < 0.0)
    discard;
```

![image-20220930162633019](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20220930162633019.png)

#### Steep Parallax Mapping

使用多个样本来确定向量

其原理为对涉及的深度 / 高度 均等分层，沿着观察方向，依次比较每层的深度和该点从深度贴图读取的深度，当后者大于前者时停下，此值即为采样值

![parallax_mapping_steep_parallax_mapping_diagram](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/parallax_mapping_steep_parallax_mapping_diagram.png)

```cpp
vec2 ParallaxMapping(vec2 texCoords, vec3 viewDir)
{
    // number of depth layers
    const float numLayers = 10;
    // calculate the size of each layer
    float layerDepth = 1.0 / numLayers;
    // depth of current layer
    float currentLayerDepth = 0.0;
    // the amount to shift the texture coordinates per layer (from vector P)
    vec2 P = viewDir.xy * height_scale;
    float deltaTexCoords = P / numLayers;

    // get initial values
    vec2  currentTexCoords     = texCoords;
    float currentDepthMapValue = texture(depthMap, currentTexCoords).r;

    while(currentLayerDepth < currentDepthMapValue)
    {
        // shift texture coordinates along direction of P
        currentTexCoords -= deltaTexCoords;
        // get depthmap value at current texture coordinates
        currentDepthMapValue = texture(depthMap, currentTexCoords).r;
        // get depth of next layer
        currentLayerDepth += layerDepth;
    }

    return currentTexCoords;
}
```

同时，也可以根据观察方向进行一个优化，垂直看时使用的样本少，角度大时样本多

```cpp
const float minLayers = 8;
const float maxLayers = 32;
float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDir)));
```

采用 Steep Parallax Mapping 容易产生锯齿，虽然可以增加样本来减缓这个问题，但相对的会增加消耗

当下流行的由两个方法 Relief Parallax Mapping 和 Parallax Occlusion Mapping，前者更精准，开销更大；后者效果差不多，但效率更高

#### Parallax Occlusion Mapping 视差遮蔽映射

Steep Parallax Mapping 使用的时触碰的第一个深度曾的纹理坐标

Steep Parallax Mapping 则是使用触碰之前和之后，在深度层之间**进行线性插值**

![How Parallax Occlusion Mapping works in OpenGL](https://learnopengl.com/img/advanced-lighting/parallax_mapping_parallax_occlusion_mapping_diagram.png)

```cpp
[...] // steep parallax mapping code here

// get texture coordinates before collision (reverse operations)
vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

// get depth after and before collision for linear interpolation
float afterDepth  = currentDepthMapValue - currentLayerDepth;
float beforeDepth = texture(depthMap, prevTexCoords).r - (currentLayerDepth - layerDepth);

// interpolation of texture coordinates
float weight = afterDepth / (afterDepth - beforeDepth);
vec2 finalTexCoords = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

return finalTexCoords;
```

### HDR(High Dynamic Range, 高动态范围)

当场景中多个位置的实际亮度数值超过了 1.0，但会被着色器约束在 1.0，这就导致了结果丢失了很多亮度细节，混成一片

![image-20221004102029691](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004102029691.png)

好的方法应该是允许数值超出 1.0，最终将整个范围映射回[0.0, 1.0]，从而保留细节

HDR 渲染允许用更大范围的颜色值渲染，从而获取大范围的黑暗与明亮的场景细节，最后将所有 HDR 值转换成在[0.0, 1.0]范围的 LDR(Low Dynamic Range,低动态范围)

转换 HDR 值到 LDR 值得过程叫做色调映射(Tone Mapping)

#### Floating point framebuffers 浮点帧缓冲

当一个帧缓冲的颜色缓冲的内部格式被设定成了`GL_RGB16F`, `GL_RGBA16F`, `GL_RGB32F` 或者`GL_RGBA32F`时，这些帧缓冲被叫做浮点帧缓冲(Floating Point Framebuffer)

浮点帧缓冲可以存储超过 0.0 到 1.0 范围的浮点值，所以非常适合 HDR 渲染

```cpp
glBindTexture(GL_TEXTURE_2D, colorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_FLOAT, NULL);  // GL_FLOAT nor GL_UNSIGNED_BYTE
```

默认的帧缓冲默认一个颜色分量只占用 8 位(bits)，通常 16 位就够用了

```cpp
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
// 渲染(光照的)场景
[...]
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// 现在使用一个不同的着色器将HDR颜色缓冲渲染至2D铺屏四边形上
hdrShader.Use();
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, hdrColorBufferTexture);
RenderQuad();
```

当直接采样浮点颜色缓冲并将其作为片段着色器的输出，即常规操作时，所有片段着色器的输出值被约束在 0.0 到 1.0 间，显然丢失了很多细节

```cpp
// fragment
#version 330 core
out vec4 color;
in vec2 TexCoords;

uniform sampler2D hdrBuffer;

void main()
{
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;
    color = vec4(hdrColor, 1.0);
}
```

![image-20221004103253657](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004103253657.png)

#### Tone mapping 色调映射

##### Reinhard tone mapping

最简单的色调映射算法，平均地将所有亮度值分散到 LDR 上

这个算法是倾向明亮的区域，暗的区域会不那么精细也不那么有区分度

```cpp
void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // Reinhard色调映射
    vec3 mapped = hdrColor / (hdrColor + vec3(1.0));
    // Gamma校正
    mapped = pow(mapped, vec3(1.0 / gamma));

    color = vec4(mapped, 1.0);
}
```

##### 曝光(Exposure)参数

```cpp
uniform float exposure;

void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(hdrBuffer, TexCoords).rgb;

    // 曝光色调映射
    vec3 mapped = vec3(1.0) - exp(-hdrColor * exposure);
    // Gamma校正
    mapped = pow(mapped, vec3(1.0 / gamma));

    color = vec4(mapped, 1.0);
}
```

![image-20221004111448208](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004111448208.png)

### Bloom 泛光

通过泛光生成光晕来表现强光

![image-20221004115749449](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004115749449.png)

泛光的步骤：

首先渲染一个场景，提取出其中亮度超过一定阈值的 fragment，将该部分模糊，叠加到原有场景上

![image-20221004120000000](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004120000000.png)

#### 提取亮色

可以使用 MRT（Multiple Render Targets，多渲染目标）的小技巧，在片段着色器指定多个输出

```cpp
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;
```

使用多个像素着色器输出的必要条件是，有多个颜色缓冲附加到了当前绑定的帧缓冲对象上

```cpp
// Set up floating point framebuffer to render scene to
GLuint hdrFBO;
glGenFramebuffers(1, &hdrFBO);
glBindFramebuffer(GL_FRAMEBUFFER, hdrFBO);
GLuint colorBuffers[2];
glGenTextures(2, colorBuffers);
for (GLuint i = 0; i < 2; i++)
{
    glBindTexture(GL_TEXTURE_2D, colorBuffers[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGB16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    // attach texture to framebuffer
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0 + i, GL_TEXTURE_2D, colorBuffers[i], 0
    );
}
```

需要显式告知 OpenGL 我们正在通过 glDrawBuffers 渲染到多个颜色缓冲，否则 OpenGL 只会渲染到帧缓冲的第一个颜色附件，而忽略所有其他的

```cpp
GLuint attachments[2] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1 };
glDrawBuffers(2, attachments);
```

```cpp
#version 330 core
layout (location = 0) out vec4 FragColor;
layout (location = 1) out vec4 BrightColor;

[...]

void main()
{
    [...] // first do normal lighting calculations and output results
    FragColor = vec4(lighting, 1.0f);
    // Check whether fragment output is higher than threshold, if so output as brightness color
    float brightness = dot(FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 1.0)
        BrightColor = vec4(FragColor.rgb, 1.0);
}
```

![image-20221004120558571](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004120558571.png)

BLOOM 在 HDR 基础上能够运行得很好，因为 HDR 中，可以将颜色值指定超过 1.0 这个默认的范围，就能够对一个图像中的亮度有更好的控制权

没有 HDR 时，必须将阈限设置为小于 1.0 的数，虽然可行，但是亮部很容易变得很多，这就导致光晕效果过重

#### 高斯模糊

高斯曲线在它的中间处的面积最大，使用它的值作为权重使得近处的样本拥有最大的优先权

比如，如果从 fragment 的 32×32 的四方形区域采样，这个权重随着和 fragment 的距离变大逐渐减小，通常这会得到更好更真实的模糊效果，这种模糊叫做高斯模糊。

![img](https://learnopengl-cn.github.io/img/05/07/bloom_gaussian.png)

以一个 32×32 的模糊 kernel 为例，为了避免对每个四边形都进行 32 x 32 次采样，高斯方程允许我们把二维方程分解为两个更小的方程：**一个描述水平权重，另一个描述垂直权重**，这样仅需进行 32 + 32 次采样

![img](https://learnopengl-cn.github.io/img/05/07/bloom_gaussian_two_pass.png)

```cpp
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D image;

uniform bool horizontal;

uniform float weight[5] = float[] (0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main()
{
    vec2 tex_offset = 1.0 / textureSize(image, 0); // gets size of single texel
    vec3 result = texture(image, TexCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(tex_offset.x * i, 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, TexCoords + vec2(0.0, tex_offset.y * i)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(0.0, tex_offset.y * i)).rgb * weight[i];
        }
    }
    FragColor = vec4(result, 1.0);
}
```

申请两个帧缓冲，各自绑定一个颜色缓冲纹理

```cpp
GLuint pingpongFBO[2];
GLuint pingpongBuffer[2];
glGenFramebuffers(2, pingpongFBO);
glGenTextures(2, pingpongBuffer);
for (GLuint i = 0; i < 2; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[i]);
    glBindTexture(GL_TEXTURE_2D, pingpongBuffer[i]);
    glTexImage2D(
        GL_TEXTURE_2D, 0, GL_RGB16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_FLOAT, NULL
    );
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glFramebufferTexture2D(
        GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, pingpongBuffer[i], 0
    );
}
```

交替使用两个缓冲

```cpp
GLboolean horizontal = true, first_iteration = true;
GLuint amount = 10;
shaderBlur.Use();
for (GLuint i = 0; i < amount; i++)
{
    glBindFramebuffer(GL_FRAMEBUFFER, pingpongFBO[horizontal]);
    glUniform1i(glGetUniformLocation(shaderBlur.Program, "horizontal"), horizontal);
    glBindTexture(
        GL_TEXTURE_2D, first_iteration ? colorBuffers[1] : pingpongBuffers[!horizontal]		//第一次的时候选择过滤过的贴图附件
    );
    RenderQuad();
    horizontal = !horizontal;
    if (first_iteration)
        first_iteration = false;
}
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

#### Combine

```cpp
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D scene;
uniform sampler2D bloomBlur;
uniform float exposure;

void main()
{
    const float gamma = 2.2;
    vec3 hdrColor = texture(scene, TexCoords).rgb;
    vec3 bloomColor = texture(bloomBlur, TexCoords).rgb;
    hdrColor += bloomColor; // additive blending
    // tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * exposure);
    // also gamma correct while we're at it
    result = pow(result, vec3(1.0 / gamma));
    FragColor = vec4(result, 1.0f);
}
```

要注意的是我们要在应用色调映射之前添加泛光效果。这样添加的亮区的泛光，也会柔和转换为 LDR，光照效果相对会更好。

### Deferred Shading 延迟着色

之前一直使用的光照方式叫做**正向渲染(Forward Rendering)**或者**正向着色法(Forward Shading)**

正向渲染很直接，容易理解，但同时它对程序性能的影响也很大，因为对于每一个需要渲染的物体，程序都要对每一个光源与每一个需要渲染的片段进行迭代

**Deferred Shading** 适用于优化拥有大量光源的场景，它包含两个处理阶段(Pass)：

在第一个几何处理阶段(Geometry Pass)中，先渲染场景一次，之后获取对象的各种几何信息，并储存在一系列叫做 G 缓冲(G-buffer)的纹理中

![image-20221004152658611](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004152658611.png)

在第二个光照处理阶段(Lighting Pass)中使用 G 缓冲内的纹理数据，渲染一个屏幕大小的方形，并使用 G 缓冲中的几何数据对每一个片段计算场景的光照；在每个像素中都会对 G 缓冲进行迭代

![image-20221004153252934](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004153252934.png)

这种渲染方法一个很大的好处就是能保证在 G 缓冲中的片段和在屏幕上呈现的像素所包含的片段信息是一样的，因为深度测试已经最终将这里的片段信息作为最顶层的片段。

这样保证了对于在光照处理阶段中处理的每一个像素都只处理一次，从而能够避免很多无用的渲染调用

不足：会占用较大的显存，不支持 blend 和 MSAA

#### G - buffer

G-buffer 是对最终光照处理相关的所有纹理的集合概念，这些纹理中存储着用于计算的数据

在正向渲染中照亮一个片段所需要的所有数据：

- 一个 3D**位置**向量来计算(插值)片段位置变量供`lightDir`和`viewDir`使用 —— **FragPos**
- 一个 RGB 漫反射**颜色向量**，也就是反照率(Albedo) —— **diffuse**
- 一个 3D**法向量**来判断平面的斜率 —— **normal**
- 一个**镜面强度(Specular Intensity)**浮点值 —— **spec**
- 所有光源的位置和颜色向量 —— **lightPos + lightColor**
- 玩家或者观察者的位置向量 —— **viewDir**

```cpp
while(...) // 游戏循环
{
    // 1. 几何处理阶段：渲染所有的几何/颜色数据到G缓冲
    glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    gBufferShader.Use();
    for(Object obj : Objects)
    {
        ConfigureShaderTransformsAndUniforms();
        obj.Draw();
    }
    // 2. 光照处理阶段：使用G缓冲计算场景的光照
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glClear(GL_COLOR_BUFFER_BIT);
    lightingPassShader.Use();
    BindAllGBufferTextures();
    SetLightingUniforms();
    RenderQuad();
}
```

使用**多渲染目标(Multiple Render Targets)**来在一个渲染处理之内渲染多个颜色缓冲

```cpp
GLuint gBuffer;
glGenFramebuffers(1, &gBuffer);
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
GLuint gPosition, gNormal, gColorSpec;

// - 位置颜色缓冲
glGenTextures(1, &gPosition);
glBindTexture(GL_TEXTURE_2D, gPosition);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, gPosition, 0

// - 法线颜色缓冲
glGenTextures(1, &gNormal);
glBindTexture(GL_TEXTURE_2D, gNormal);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGB, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, gNormal, 0);

// - 颜色 + 镜面颜色缓冲
glGenTextures(1, &gAlbedoSpec);
glBindTexture(GL_TEXTURE_2D, gAlbedoSpec);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, SCR_WIDTH, SCR_HEIGHT, 0, GL_RGBA, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, gAlbedoSpec, 0);

// - 告诉OpenGL我们将要使用(帧缓冲的)哪种颜色附件来进行渲染
GLuint attachments[3] = { GL_COLOR_ATTACHMENT0, GL_COLOR_ATTACHMENT1, GL_COLOR_ATTACHMENT2 };
glDrawBuffers(3, attachments);

// 之后同样添加渲染缓冲对象(Render Buffer Object)为深度缓冲(Depth Buffer)，并检查完整性
[...]
```

```cpp
// fragment
#version 330 core
layout (location = 0) out vec3 gPosition;
layout (location = 1) out vec3 gNormal;
layout (location = 2) out vec4 gAlbedoSpec;

in vec2 TexCoords;
in vec3 FragPos;
in vec3 Normal;

uniform sampler2D texture_diffuse1;
uniform sampler2D texture_specular1;

void main()
{
    // 存储第一个G缓冲纹理中的片段位置向量
    gPosition = FragPos;
    // 同样存储对每个逐片段法线到G缓冲中
    gNormal = normalize(Normal);
    // 和漫反射对每个逐片段颜色
    gAlbedoSpec.rgb = texture(texture_diffuse1, TexCoords).rgb;
    // 存储镜面强度到gAlbedoSpec的alpha分量
    gAlbedoSpec.a = texture(texture_specular1, TexCoords).r;
}
```

#### 延迟光照处理阶段

绑定所有贴图

```cpp
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shaderLightingPass.Use();
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, gPosition);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, gNormal);
glActiveTexture(GL_TEXTURE2);
glBindTexture(GL_TEXTURE_2D, gAlbedoSpec);
// 同样发送光照相关的uniform
SendAllLightUniformsToShader(shaderLightingPass);
glUniform3fv(glGetUniformLocation(shaderLightingPass.Program, "viewPos"), 1, &camera.Position[0]);
RenderQuad();
```

读取数据并计算光照即可

```cpp
// fragment
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

struct Light {
    vec3 Position;
    vec3 Color;
};
const int NR_LIGHTS = 32;
uniform Light lights[NR_LIGHTS];
uniform vec3 viewPos;

void main()
{
    // 从G缓冲中获取数据
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Albedo = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    // 然后和往常一样地计算光照
    vec3 lighting = Albedo * 0.1; // 硬编码环境光照分量
    vec3 viewDir = normalize(viewPos - FragPos);
    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // 漫反射
        vec3 lightDir = normalize(lights[i].Position - FragPos);
        vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Albedo * lights[i].Color;
        lighting += diffuse;
    }

    FragColor = vec4(lighting, 1.0);
}
```

#### 结合延迟渲染与正向渲染

deferred shading 不能处理 blend，因为 G-buffer 存储的是最终的片段信息，为此可以结合正向渲染

即在延迟渲染结束输出后，再开始进行正向渲染的部分

```cpp
// 延迟渲染光照渲染阶段
[...]
RenderQuad();

// 现在像正常情况一样正向渲染所有光立方体
shaderLightBox.Use();
glUniformMatrix4fv(locProjection, 1, GL_FALSE, glm::value_ptr(projection));
glUniformMatrix4fv(locView, 1, GL_FALSE, glm::value_ptr(view));
for (GLuint i = 0; i < lightPositions.size(); i++)
{
    model = glm::mat4();
    model = glm::translate(model, lightPositions[i]);
    model = glm::scale(model, glm::vec3(0.25f));
    glUniformMatrix4fv(locModel, 1, GL_FALSE, glm::value_ptr(model));
    glUniform3fv(locLightcolor, 1, &lightColors[i][0]);
    RenderCube();
}
```

PS：由于延迟渲染的结果是张图，因而需要将渲染过程中生成的 depthbuffer 传输给正向渲染的部分，否则正向渲染的结果会全部显示在延迟渲染结果之前 / 之后

![image-20221004165913410](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004165913410.png)

```cpp
glBindFramebuffer(GL_READ_FRAMEBUFFER, gBuffer);
glBindFramebuffer(GL_DRAW_FRAMEBUFFER, 0); // 写入到默认帧缓冲
glBlitFramebuffer(
  0, 0, SCR_WIDTH, SCR_HEIGHT, 0, 0, SCR_WIDTH, SCR_HEIGHT, GL_DEPTH_BUFFER_BIT, GL_NEAREST
);
glBindFramebuffer(GL_FRAMEBUFFER, 0);
// 现在像之前一样渲染光立方体
[...]
```

![image-20221004170009514](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221004170009514.png)

#### 更多的光源

延迟渲染一直被称赞的原因就是它能够渲染大量的光源而不消耗大量的性能

然而，延迟渲染本身并不能支持非常大量的光源，因为仍必须对场景中每一个光源计算每一个片段的光照分量

真正让大量光源成为可能的是我们能够对延迟渲染管线引用的一个非常棒的优化：**光体积(Light Volumes)**

即，计算光源的覆盖半径，从而过滤掉对物体无影响的光源

##### 计算一个光源的体积或半径

$$
F_{light} = \frac{I}{K_c + K_l * d + K_q * d^2}
$$

即求该等式接近 0 时的解。

我们选择`5/256`作为一个合适的光照值；除以 256 是因为默认的 8-bit 帧缓冲可以为每个分量显示这么多强度值(Intensity)。

方程简化为

$$
\frac{5}{256} = \frac{I_{max}}{Attenuation}
$$

$$
Attenuation = I_{max} * \frac{256}{5}
$$

$$
K_q * d^2 + K_l * d + K_c - I_{max} * \frac{256}{5} = 0
$$

$$
d = \frac{-K_l + \sqrt{K_l^2 - 4 * K_q * (K_c - I_{max} * \frac{256}{5})}}{2 * K_q}
$$

```cpp
GLfloat constant  = 1.0;
GLfloat linear    = 0.7;
GLfloat quadratic = 1.8;
GLfloat lightMax  = std::fmaxf(std::fmaxf(lightColor.r, lightColor.g), lightColor.b);
GLfloat radius    =  (-linear +  std::sqrtf(linear * linear - 4 * quadratic * (constant - (256.0 / 5.0) * lightMax)))
  / (2 * quadratic);
```

```cpp
struct Light {
    [...]
    float Radius;
};

void main()
{
    [...]
    for(int i = 0; i < NR_LIGHTS; ++i)
    {
        // 计算光源和该片段间距离
        float distance = length(lights[i].Position - FragPos);
        if(distance < lights[i].Radius)
        {
            // 执行大开销光照
            [...]
        }
    }
}
```

事实上，这在实际运行中，仍会有较大开销，因为我们并不清楚哪些片段在光源覆盖范围之外，即，我们仍在对屏幕中每一个片段遍历每一个光源进行计算

更实际的方法是利用延迟着色渲染真实的球体，并根据光源半径对该球体进行 scale，从而球体所覆盖的像素范围，即光源照射到的像素范围，进而过滤无关联的像素

### SSAO(Screen-Space Ambient Occlusion)

在之前的章节中，一直使用环境光照模拟光的**散射（Scattering）**，但实际上，这并非是一个不变的常量

有一种间接光照的模拟叫做**环境光遮蔽(Ambient Occlusion)**，它的原理是通过将褶皱、孔洞和非常靠近的墙面（即光线难以进入的地方）变暗的方法近似模拟出间接光照

![image-20221005093939236](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221005093939236.png)

环境光遮蔽需要考虑周围的几何体，这会造成巨大开销

**屏幕空间环境光遮蔽(Screen-Space Ambient Occlusion, SSAO)**技术使用了屏幕空间场景的深度而不是真实的几何体数据来确定遮蔽量

SSAO 的原理：对于铺屏四边形(Screen-filled Quad)上的每一个片段，我们都会根据周边深度值计算一个**遮蔽因子(Occlusion Factor)**，这个遮蔽因子之后会被用来减少或者抵消片段的环境光照分量。

遮蔽因子是通过采集片段周围多个球型核心(Kernel)深度样本，并和当前片段深度值对比而得到的

高于片段深度值样本的个数就是我们想要的遮蔽因子。

![img](https://learnopengl-cn.github.io/img/05/09/ssao_crysis_circle.png)

上图中在几何体内灰色的深度样本都是高于片段深度值的，他们会增加遮蔽因子；几何体内样本个数越多，片段获得的环境光照也就越少

显然，渲染效果的质量和精度与采样的样本数量有直接关系，**样本数量太低，会形成波纹（Banding）**，太多则影响性能

通常可以引入随机性采样来减少采样数，但会导致噪声，需要模糊（Blur）进一步修复

![img](https://learnopengl-cn.github.io/img/05/09/ssao_banding_noise.jpg)

缺陷：由于采样核心是个球体，这将导致平整的墙面也显得灰暗，通常采用**法向半球体(Normal-oriented Hemisphere)**采样，从而不用考虑片段底部的几何体

![img](https://learnopengl-cn.github.io/img/05/09/ssao_hemisphere.png)

#### 样本缓冲

对于每一个片段，需要这些数据：

- 逐片段**位置**向量
- 逐片段的**法线**向量
- 逐片段的**反射颜色**
- **采样核心**
- 用来旋转采样核心的随机旋转矢量

![img](https://learnopengl-cn.github.io/img/05/09/ssao_overview.png)

SSAO 和延迟渲染近似，本质上都是根据 G-buffer 对最终光照结果进行计算，并不保留场景的几何信息

#### 法向半球

![img](https://learnopengl-cn.github.io/img/05/09/ssao_hemisphere.png)

```cpp
std::uniform_real_distribution<GLfloat> randomFloats(0.0, 1.0); // 随机浮点数，范围0.0 - 1.0
std::default_random_engine generator;
std::vector<glm::vec3> ssaoKernel;
for (GLuint i = 0; i < 64; ++i)
{
    glm::vec3 sample(
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator)
    );
    sample = glm::normalize(sample);
    sample *= randomFloats(generator);
    ssaoKernel.push_back(sample);
}
```

在切线空间中以-1.0 到 1.0 为范围变换 x 和 y 方向，并以 0.0 和 1.0 为范围变换样本的 z 方向(如果以-1.0 到 1.0 为范围，取样核心就变成球型了)。由于采样核心将会沿着表面法线对齐，所得的样本矢量将会在半球里

为了尽可能使将本靠近原心，而不是范围内均匀分布，引入一个加速插值函数

```cpp
   float scale = (float)i / 64.0;
   scale   = lerp(0.1f, 1.0f, scale * scale);
   sample *= scale;
   ssaoKernel.push_back(sample);
```

![image-20221005100507320](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221005100507320.png)

```cpp
GLfloat lerp(GLfloat a, GLfloat b, GLfloat f)
{
    return a + f * (b - a);
}
```

![img](https://learnopengl-cn.github.io/img/05/09/ssao_kernel_weight.png)

#### Random kernel rotations

之前提到，通过引入一些随机性到采样核心上，可以大大减少获得不错结果所需的样本数量

为了减少损耗，好的方法是创建一个小的随机旋转向量纹理平铺在屏幕上

创建一个 4x4 朝向切线空间平面法线的随机旋转向量数组：

```cpp
std::vector<glm::vec3> ssaoNoise;
for (GLuint i = 0; i < 16; i++)
{
    glm::vec3 noise(
        randomFloats(generator) * 2.0 - 1.0,
        randomFloats(generator) * 2.0 - 1.0,
        0.0f); 		// 由于采样核心是沿着正z方向在切线空间内旋转，设定z分量为0.0，从而围绕z轴旋转
    ssaoNoise.push_back(noise);
}
```

```cpp
unsigned int noiseTexture;
glGenTextures(1, &noiseTexture);
glBindTexture(GL_TEXTURE_2D, noiseTexture);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, 4, 4, 0, GL_RGB, GL_FLOAT, &ssaoNoise[0]);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
```

#### SSAO 着色器

首先绑定一个帧缓冲储存 SSAO 结果

```cpp
unsigned int ssaoFBO;
glGenFramebuffers(1, &ssaoFBO);
glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);

unsigned int ssaoColorBuffer;
glGenTextures(1, &ssaoColorBuffer);
glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, SCR_WIDTH, SCR_HEIGHT, 0, GL_RED, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, ssaoColorBuffer, 0);
```

由于环境遮蔽的结果是一个灰度值，我们只需要纹理的红色分量，所以将颜色缓冲的内部格式设置为`GL_RED`

整体过程：

```cpp

// geometry pass: render stuff into G-buffer
glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
    [...]
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// use G-buffer to render SSAO texture
glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);
    glClear(GL_COLOR_BUFFER_BIT);
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, gPosition);
    glActiveTexture(GL_TEXTURE1);
    glBindTexture(GL_TEXTURE_2D, gNormal);
    glActiveTexture(GL_TEXTURE2);
    glBindTexture(GL_TEXTURE_2D, noiseTexture);
    shaderSSAO.use();
    SendKernelSamplesToShader();
    shaderSSAO.setMat4("projection", projection);
    RenderQuad();
glBindFramebuffer(GL_FRAMEBUFFER, 0);

// lighting pass: render scene lighting
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
shaderLightingPass.use();
[...]
glActiveTexture(GL_TEXTURE3);
glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
[...]
RenderQuad();
```

```cpp
// fragment
#version 330 core
out float FragColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D texNoise;

uniform vec3 samples[64];
uniform mat4 projection;

// tile noise texture over screen, based on screen dimensions divided by noise size
const vec2 noiseScale = vec2(800.0/4.0, 600.0/4.0); // screen = 800x600

void main()
{
    [...]
}
```

注意我们这里有一个`noiseScale`的变量。我们想要将噪声纹理平铺(Tile)在屏幕上，但是由于`TexCoords`的取值在 0.0 和 1.0 之间，`texNoise`纹理将不会平铺。所以我们将通过屏幕分辨率除以噪声纹理大小的方式计算`TexCoords`的缩放大小，并在之后提取相关输入向量的时候使用

```cpp
vec3 fragPos = texture(gPositionDepth, TexCoords).xyz;
vec3 normal = texture(gNormal, TexCoords).rgb;
vec3 randomVec = texture(texNoise, TexCoords * noiseScale).xyz;
```

```cpp
vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));	// 施密德正交
vec3 bitangent = cross(normal, tangent);
mat3 TBN = mat3(tangent, bitangent, normal);
```

通过使用一个叫做 Gramm-Schmidt 处理(Gramm-Schmidt Process)的过程，创建了一个正交基(Orthogonal Basis)，每一次它都会根据`randomVec`的值稍微倾斜

注意因为使用了一个随机向量来构造切线向量，因此没必要有一个恰好沿着几何体表面的 TBN 矩阵，也就是不需要逐顶点切线(和双切)向量

接下来对每个核心样本进行迭代，将样本从切线空间变换到观察空间，将它们加到当前像素位置上，并将片段位置深度与储存在原始深度缓冲中的样本深度进行比较，具体步骤如下

第一步：将核心偏移样本转换到观察空间，并叠加到片段位置上

```cpp
float occlusion = 0.0;
for(int i = 0; i < kernelSize; ++i)
{
    // get sample position
    vec3 samplePos = TBN * samples[i]; // from tangent to view-space
    samplePos = fragPos + samplePos * radius;

    [...]
}
```

这里的`kernelSize`和`radius`变量都可以用来调整效果；在这里我们分别保持他们的默认值为`64`和`1.0`

`radius`乘上偏移样本来增加(或减少)SSAO 的有效取样半径。

第二步：变换`sample`到屏幕空间，从而取样`sample`的(线性)深度值

```cpp
vec4 offset = vec4(samplePos, 1.0);
offset      = projection * offset;    // from view to clip-space
offset.xyz /= offset.w;               // perspective divide
offset.xyz  = offset.xyz * 0.5 + 0.5; // transform to range 0.0 - 1.0
```

利用透视矩阵变换到裁剪空间后，手动进行透视除法转换为 NDC，再转换到[0.0, 1.0]范围，从而用于采样

```cpp
float sampleDepth = texture(gPosition, offset.xy).z;
```

引入一个边缘检测，避免表面边缘处在表面之下的深度对遮蔽因子造成的影响

```cpp
float rangeCheck = smoothstep(0.0, 1.0, radius / abs(fragPos.z - sampleDepth));
occlusion       += (sampleDepth >= samplePos.z + bias ? 1.0 : 0.0) * rangeCheck;
```

![img](https://learnopengl-cn.github.io/img/05/09/ssao_smoothstep.png)

最后一步：需要将遮蔽贡献根据核心的大小标准化，并输出结果

```cpp
occlusion = 1.0 - (occlusion / kernelSize);
FragColor = occlusion;
```

![img](https://learnopengl-cn.github.io/img/05/09/ssao_without_blur.png)

#### 环境遮蔽模糊

在 SSAO 阶段和光照阶段之间，我们想要进行模糊 SSAO 纹理的处理，所以又创建了一个帧缓冲对象来储存模糊结果

```cpp
unsigned int ssaoBlurFBO, ssaoColorBufferBlur;
glGenFramebuffers(1, &ssaoBlurFBO);
glBindFramebuffer(GL_FRAMEBUFFER, ssaoBlurFBO);
glGenTextures(1, &ssaoColorBufferBlur);
glBindTexture(GL_TEXTURE_2D, ssaoColorBufferBlur);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RED, SCR_WIDTH, SCR_HEIGHT, 0, GL_RED, GL_FLOAT, NULL);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, ssaoColorBufferBlur, 0);
```

```cpp
#version 330 core
in vec2 TexCoords;
out float fragColor;

uniform sampler2D ssaoInput;

void main() {
    vec2 texelSize = 1.0 / vec2(textureSize(ssaoInput, 0));
    float result = 0.0;
    for (int x = -2; x < 2; ++x)
    {
        for (int y = -2; y < 2; ++y)
        {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            result += texture(ssaoInput, TexCoords + offset).r;
        }
    }
    fragColor = result / (4.0 * 4.0);
}
```

![img](https://learnopengl-cn.github.io/img/05/09/ssao.png)

#### 应用环境遮蔽

将逐片段环境遮蔽因子乘到光照环境分量上

```cpp
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;

uniform sampler2D gPositionDepth;
uniform sampler2D gNormal;
uniform sampler2D gAlbedo;
uniform sampler2D ssao;

struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
    float Radius;
};
uniform Light light;

void main()
{
    // 从G缓冲中提取数据
    vec3 FragPos = texture(gPositionDepth, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedo, TexCoords).rgb;
    float AmbientOcclusion = texture(ssao, TexCoords).r;

    // Blinn-Phong (观察空间中)
    vec3 ambient = vec3(0.3 * AmbientOcclusion); // 这里我们加上遮蔽因子
    vec3 lighting  = ambient;
    vec3 viewDir  = normalize(-FragPos); // Viewpos 为 (0.0.0)，在观察空间中
    // 漫反射
    vec3 lightDir = normalize(light.Position - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * light.Color;
    // 镜面
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(Normal, halfwayDir), 0.0), 8.0);
    vec3 specular = light.Color * spec;
    // 衰减
    float dist = length(light.Position - FragPos);
    float attenuation = 1.0 / (1.0 + light.Linear * dist + light.Quadratic * dist * dist);
    diffuse  *= attenuation;
    specular *= attenuation;
    lighting += diffuse + specular;

    FragColor = vec4(lighting, 1.0);
}
```

![img](https://learnopengl-cn.github.io/img/05/09/ssao_final.png)

## PBR (physically based rendering)

### Theory

基于物理的渲染是对基于物理原理的现实世界的一种近似

判断一种 PBR 光照模型是否是基于物理的，必须满足以下三个条件

1. 基于微平面(Microfacet)的表面模型。
2. 能量守恒。
3. 应用基于物理的 BRDF。

#### The microfacet model

这项理论认为，达到微观尺度之后任何平面都可以用被称为微平面(Microfacets)的细小镜面来进行描绘

![Different surface types for OpenGL PBR](https://learnopengl.com/img/pbr/microfacets.png)

一个平面越是粗糙，这个平面上的微平面的排列就越混乱

![Effect of light scattering on different surface types for OpenGL PBR](https://learnopengl.com/img/pbr/microfacets_light_rays.png)

由于这些微平面已经微小到无法逐像素的继续对其进行区分，我们只有假设一个粗糙度(Roughness)参数，然后用统计学的方法来概略的估算微平面的粗糙程度

我们可以基于一个平面的粗糙度来计算出半程向量与微平面平均取向方向一致的概率

微平面的取向方向与半程向量的方向越是一致，镜面反射的效果就越是强烈越是锐利

![img](https://learnopengl-cn.github.io/img/07/01/ndf.png)

#### Energy conservation

出射光线的能量永远不能超过入射光线的能量

入射光线可分为直接被反射的镜面光照部分，和被折射吸收的漫反射光照部分，整体称为散射

![img](https://learnopengl-cn.github.io/img/07/01/surface_reaction.png)

在一些次表面散射技术的着色器还会考虑进入物体的光经过散射再发射出来，主要应用于皮肤、大理石等材质，PBR 中则对此做了简化，认为折射光不会再发射出去

同时 PBR 认为反射光与折射光它们二者之间是**互斥**的，被材质表面反射的能量将无法再被材质吸收

```cpp
float kS = calculateSpecularComponent(...); // 反射/镜面 部分
float kD = 1.0 - ks;
```

#### 反射率方程 The reflectance equation

$$
L_o(p,\omega_o) = \int\limits_{\Omega} f_r(p,\omega_i,\omega_o) L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

**辐射通量 Φ：**辐射通量 Φ 表示的是一个光源所输出的能量，以瓦特为单位。辐射通量将会计算这个由不同波长构成的函数的总面积

![img](https://learnopengl-cn.github.io/img/07/01/daylight_spectral_distribution.png)

**立体角 ω：**立体角用 ω 表示，它可以为我们描述投射到单位球体上的一个截面的大小或者面积。投射到这个单位球体上的截面的面积就被称为立体角(Solid Angle)：

![img](https://learnopengl-cn.github.io/img/07/01/solid_angle.png)

**辐射强度 I：**辐射强度(Radiant Intensity)表示的是在单位球面上，一个光源向每单位立体角所投送的辐射通量。举例来说，假设一个全向光源向所有方向均匀的辐射能量，辐射强度就能帮我们计算出它在一个单位面积（立体角）内的能量大小：

![img](https://learnopengl-cn.github.io/img/07/01/radiant_intensity.png)

$$
I = \frac{d\Phi}{d\omega}
$$

$$
L=\frac{d^2\Phi}{ dA d\omega \cos\theta}
$$

![img](https://learnopengl-cn.github.io/img/07/01/radiance.png)

$$
L_o(p,\omega_o) = \int\limits_{\Omega} f_r(p,\omega_i,\omega_o) L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

![img](https://learnopengl-cn.github.io/img/07/01/hemisphere.png)

渲染方程可以理解成，从 ω0 方向观察点 P 在入射光入射后所反射向 ω0 方向的光 L0。其中入射光包括各个方向，因此需要对半球积分

```cpp
int steps = 100;
float sum = 0.0f;
vec3 P    = ...;
vec3 Wo   = ...;
vec3 N    = ...;
float dW  = 1.0f / steps;
for(int i = 0; i < steps; ++i)
{
    vec3 Wi = getNextIncomingLightDir(i);
    sum += Fr(p, Wi, Wo) * L(p, Wi) * dot(N, Wi) * dW;
}
```

#### BRDF(Bidirectional Reflective Distribution Function)

BRDF，或者说双向反射分布函数，它接受入射（光）方向 ωi，出射（观察）方向 ωo，平面法线 n 以及一个用来表示微平面粗糙程度的参数 a 作为函数的输入参数

**BRDF 可以近似的求出每束光线对一个给定了材质属性的平面上最终反射出来的光线所作出的贡献程度**

##### Cook-Torrance BRDF

$$
f_r = k_d f_{lambert} +  k_s f_{cook-torrance}
$$

BRDF 的左侧表示的是漫反射部分，被称为 Lambertian 漫反射

$$
f_{lambert} = \frac{c}{\pi}
$$

c 表示表面颜色，除以 π 是为了对漫反射光进行标准化（从能量守恒可推导出 BRDF 范围在[0, 1/π]）

$$
f_{cook-torrance} = \frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)}
$$

Cook-Torrance BRDF 的镜面反射部分包含三个函数，此外分母部分还有一个标准化因子

字母 D、F、G 分别代表着一种类型的函数，各个函数分别用来近似的计算出表面反射特性的一个特定部分

三个函数分别为法线分布函数(Normal **D**istribution Function)，菲涅尔方程(**F**resnel Rquation)和几何函数(**G**eometry Function)：

- **法线分布函数 D**：估算在受到表面粗糙度的影响下，取向方向与半程向量一致的微平面的数量。这是用来估算微平面的主要函数。
- **几何函数 G**：描述了微平面自成阴影的属性。当一个平面相对比较粗糙的时候，平面表面上的微平面有可能挡住其他的微平面从而减少表面所反射的光线。
- **菲涅尔方程 F**：菲涅尔方程描述的是在不同的表面角下表面所反射的光线所占的比率。

#### 法线分布函数 D

**法线分布函数 D，或者说镜面分布，从统计学上近似的表示了与某些（半程）向量 h 取向一致的微平面的比率**。举例来说，假设给定向量 h，如果我们的微平面中有 35%与向量 h 取向一致，则法线分布函数或者说 NDF 将会返回 0.35

$$
NDF_{GGX TR}(n, h, \alpha) = \frac{\alpha^2}{\pi((n \cdot h)^2 (\alpha^2 - 1) + 1)^2}
$$

在这里 h 表示用来与平面上微平面做比较用的半程向量，而 α 表示表面粗糙度

![img](https://learnopengl-cn.github.io/img/07/01/ndf.png)

```cpp
float D_GGX_TR(vec3 N, vec3 H, float a)
{
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom    = a2;
    float denom  = (NdotH2 * (a2 - 1.0) + 1.0);
    denom        = PI * denom * denom;

    return nom / denom;
}
```

#### 几何函数 G

![img](https://learnopengl-cn.github.io/img/07/01/geometry_shadowing.png)

几何函数采用一个材料的粗糙度参数作为输入参数，粗糙度较高的表面其微平面间相互遮蔽的概率就越高

我们将要使用的几何函数是 GGX 与 Schlick-Beckmann 近似的结合体，因此又称为 Schlick-GGX：

$$
G_{SchlickGGX}(n, v, k) = \frac{n \cdot v}{(n \cdot v)(1 - k) + k }
$$

**这里的 k 取决于 α 是基于针对直接光照的几何函数还是针对 IBL 光照重映射(Remapping)的几何函数 :**

$$
k_{direct} = \frac{(\alpha + 1)^2}{8} \\k_{IBL} = \frac{\alpha^2}{2}
$$

为了有效的估算几何部分，需要将观察方向（几何遮蔽(Geometry Obstruction)）和光线方向向量（几何阴影(Geometry Shadowing)）都考虑进去。我们可以使用史密斯法(Smith’s method)来把两者都纳入其中：

$$
G(n, v, l, k) = G_{sub}(n, v, k) G_{sub}(n, l, k)
$$

使用史密斯法与 Schlick-GGX 作为 Gsub 可以得到如下所示不同粗糙度的视觉效果：

![img](https://learnopengl-cn.github.io/img/07/01/geometry.png)

```cpp
float GeometrySchlickGGX(float NdotV, float k)
{
    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float k)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx1 = GeometrySchlickGGX(NdotV, k);
    float ggx2 = GeometrySchlickGGX(NdotL, k);

    return ggx1 * ggx2;
}
```

#### 菲涅尔方程

**描述的是被反射的光线对比光线被折射的部分所占的比率，这个比率会随着我们观察的角度不同而不同**

菲涅尔方程是一个相当复杂的方程式，不过幸运的是菲涅尔方程可以用 Fresnel-Schlick 近似法求得近似解：

$$
F_{Schlick}(h, v, F_0) = F_0 + (1 - F_0) ( 1 - (h \cdot v))^5
$$

**F0 表示平面的基础反射率**，它是利用所谓**折射指数**(Indices of Refraction)或者说 IOR 计算得出的

菲涅尔方程还存在一些细微的问题。其中一个问题是 Fresnel-Schlick 近似仅仅对电介质或者说非金属表面有定义。对于导体(Conductor)表面（金属），使用它们的折射指数计算基础折射率并不能得出正确的结果，这样我们就需要使用一种不同的菲涅尔方程来对导体表面进行计算。

由于这样很不方便，所以我们预先计算出平面对于法向入射（F0）的反应（处于 0 度角），然后基于相应观察角的 Fresnel-Schlick 近似对这个值进行插值，用这种方法来进行进一步的估算。这样我们就能对金属和非金属材质使用同一个公式了。

平面对于法向入射的响应或者说基础反射率可以在一些[大型数据库](https://refractiveindex.info/?shelf=glass&book=BK7&page=SCHOTT)中找到

通过预先计算电介质与导体的 F0 值，我们可以对两种类型的表面使用相同的 Fresnel-Schlick 近似，但是**如果是金属表面的话就需要对基础反射率添加色彩**

一般是按下面这个样子来实现的：

```cpp
vec3 F0 = vec3(0.04);
F0      = mix(F0, surfaceColor.rgb, metalness);
```

```cpp
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0); //cosTheta是表面法向量n与观察方向v的点乘
}
```

#### Cook-Torrance 反射率方程

$$
L_o(p,\omega_o) = \int\limits_{\Omega} (k_d\frac{c}{\pi} + k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)})L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

#### 编写 PBR 材质

![image-20221005153145448](https://byran.oss-cn-hangzhou.aliyuncs.com/ComputerGraphics/image-20221005153145448.png)

**反照率**：反照率(Albedo)纹理为每一个金属的纹素(Texel)（纹理像素）指定表面颜色或者基础反射率。这和漫反射纹理类似，不同的是所有光照信息都是由一个纹理中提取的。漫反射纹理的图像当中常常包含一些细小的阴影或者深色的裂纹，而反照率纹理中只包含表面的颜色（或者折射吸收系数）

**法线**：法线贴图纹理和之前在所使用的法线贴图是完全一样的。法线贴图可以逐片段的指定独特的法线，来为表面制造出起伏不平的假象

**金属度**：金属(Metallic)贴图逐个纹素的指定该纹素是不是金属质地。根据 PBR 引擎设置的不同，既可以将金属度编写为灰度值又可以编写为 1 或 0 这样的二元值。

**粗糙度**：粗糙度(Roughness)贴图可以以纹素为单位指定某个表面有多粗糙。采样得来的粗糙度数值会影响一个表面的微平面统计学上的取向度。某些 PBR 引擎预设采用的是对某些美术师来说更加直观的光滑度(Smoothness)贴图，不过这些数值在采样之时就马上用（1.0 – 光滑度）转换成了粗糙度。

**AO**：环境光遮蔽(Ambient Occlusion)贴图或者说 AO 贴图为表面和周围潜在的几何图形指定了一个额外的阴影因子。在光照的结尾阶段引入环境遮蔽可以明显的提升场景的视觉效果

### Lighting

本质上就是根据公式进行计算

$$
L_o(p,\omega_o) = \int\limits_{\Omega}
        (k_d\frac{c}{\pi} + k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)})
        L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

由于目前仅考虑点光源，点光源对观察点的影响是单一方向的，因而不需要积分，只需遍历每一个光源即可

![img](https://learnopengl-cn.github.io/img/07/02/lighting_radiance_direct.png)

```cpp
#version 330 core
out vec4 FragColor;
in vec2 TexCoords;
in vec3 WorldPos;
in vec3 Normal;

uniform vec3 camPos;

uniform vec3  albedo;
uniform float metallic;
uniform float roughness;
uniform float ao;

const float PI = 3.14159265359;
```

#### 直接光照明

```cpp
vec3 Lo = vec3(0.0);
for(int i = 0; i < 4; ++i) 	// 四个光源
{
    vec3 L = normalize(lightPositions[i] - WorldPos);
    vec3 H = normalize(V + L);

    float distance    = length(lightPositions[i] - WorldPos);
    float attenuation = 1.0 / (distance * distance);		//点光源存在衰减
    vec3 radiance     = lightColors[i] * attenuation;
    [...]
```

准备公式：

```cpp
vec3 fresnelSchlick(float cosTheta, vec3 F0)	// 菲涅尔项
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}
```

```cpp
float DistributionGGX(vec3 N, vec3 H, float roughness)	// 法线分布函数
{
    float a      = roughness*roughness;
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}
```

```cpp
float GeometrySchlickGGX(float NdotV, float roughness)	// 几何函数
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2  = GeometrySchlickGGX(NdotV, roughness);
    float ggx1  = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
```

求值：

```cpp
vec3 F0 = vec3(0.04);
F0      = mix(F0, albedo, metallic);
vec3 F  = fresnelSchlick(max(dot(H, V), 0.0), F0);

float NDF = DistributionGGX(N, H, roughness);
float G   = GeometrySmith(N, V, L, roughness);

vec3 nominator    = NDF * G * F;
float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001; // 避免分母为0
vec3 specular     = nominator / denominator;

vec3 kS = F;
vec3 kD = vec3(1.0) - kS;

kD *= 1.0 - metallic;

float NdotL = max(dot(N, L), 0.0);
Lo += (kD * albedo / PI + specular) * radiance * NdotL;	// 注意specular BRDF中已经乘了菲涅尔系数，不用乘ks了

vec3 ambient = vec3(0.03) * albedo * ao;
vec3 color   = ambient + Lo;

color = color / (color + vec3(1.0));	// Reinhard HDR
color = pow(color, vec3(1.0/2.2)); 		// gamma correction
```

![img](https://learnopengl-cn.github.io/img/07/02/lighting_result.png)

#### 带贴图的 PBR

相比之下，只是将 albedo，metallic，roughness，ao，normal 从纹理进行采样，而不是直接给出，其他没有区别

唯一难点，法线贴图采样

```cpp
[...]
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;

void main()
{
    vec3 albedo     = pow(texture(albedoMap, TexCoords).rgb, 2.2);
    vec3 normal     = getNormalFromNormalMap();
    float metallic  = texture(metallicMap, TexCoords).r;
    float roughness = texture(roughnessMap, TexCoords).r;
    float ao        = texture(aoMap, TexCoords).r;
    [...]
}
```

![img](https://learnopengl-cn.github.io/img/07/02/lighting_textured.png)

### IBL(Image based lighting)

IBL 通常使用环境立方体贴图 (Cubemap)，它将周围环境整体视为一个大光源

IBL 对于 PBR 的意义在于它将环境光纳入计算之中，因此，相较于之前仅考虑点光源的入射方向 wi，现在需要考虑来自各个方向的 radiance

$$
L_o(p,\omega_o) = \int\limits_{\Omega}
        (k_d\frac{c}{\pi} + k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)})
        L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

这为解决积分提出了两个要求：

- 给定任何方向向量 wi ，需要一些方法来获取这个方向上场景的辐射度
- 解决积分需要快速且实时

第一个要求相对简单，可以采用立方体贴图，使用向量 wi 在贴图上采样

```cpp
vec3 radiance =  texture(_cubemapEnvironment, w_i).rgb;
```

为了以更有效的方式解决积分，我们需要对其大部分结果进行预处理——或称预计算

仔细研究反射方程，我们发现 BRDF 的漫反射 kd 和镜面 ks 项是相互独立的，我们可以将积分分成两部分：

$$
L_o(p,\omega_o) =
        \int\limits_{\Omega} (k_d\frac{c}{\pi}) L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
        +
        \int\limits_{\Omega} (k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)})
            L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

通过将积分分成两部分，可以分开研究**漫反射和镜面反射**部分

#### Diffuse irradiance

仔细观察漫反射积分，我们发现漫反射兰伯特项是一个常数项（颜色 c 、折射率 kd 和 π 在整个积分是常数），不依赖于任何积分变量。基于此，我们可以将常数项移出漫反射积分，该积分仅依赖 wi：

$$
L_o(p,\omega_o) =
        k_d\frac{c}{\pi} \int\limits_{\Omega} L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

从而就能预计算一个新的立方体贴图，称为 **Irradiance map**

计算方法采用卷积，通过对半球 Ω 上的大量方向进行离散采样并对其辐射度取平均值，来计算每个输出采样方向 wo 的积分

![img](https://learnopengl-cn.github.io/img/07/03/01/ibl_hemisphere_sample.png)

从而根据 **Irradiance map**便能直接采样场景的 Irrandiance

![img](https://learnopengl-cn.github.io/img/07/03/01/ibl_irradiance.png)

##### 辐射度的 HDR 文件格式

radiance file 的格式（扩展名为 .hdr）存储了一张完整的立方体贴图，所有六个面数据都是浮点数，允许指定 0.0 到 1.0 范围之外的颜色值，以使光线具有正确的颜色强度

这个文件格式使用了一个聪明的技巧来存储每个浮点值：它并非直接存储每个通道的 32 位数据，而是每个通道存储 8 位，再以 alpha 通道存放指数

这张环境贴图是从球体投影到平面上，以使我们可以轻松地将环境信息存储到一张等距柱状投影图(Equirectangular Map) 中

[sIBL 档案](http://www.hdrlabs.com/sibl/archive.html) 中有很多可以免费获取的辐射度 HDR 环境贴图

![img](https://learnopengl-cn.github.io/img/07/03/01/ibl_hdr_radiance.png)

##### HDR 和 stb_image.h

```cpp
#include "stb_image.h"
[...]

stbi_set_flip_vertically_on_load(true);
int width, height, nrComponents;
float *data = stbi_loadf("newport_loft.hdr", &width, &height, &nrComponents, 0);
unsigned int hdrTexture;
if (data)
{
    glGenTextures(1, &hdrTexture);
    glBindTexture(GL_TEXTURE_2D, hdrTexture);
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB16F, width, height, 0, GL_RGB, GL_FLOAT, data);

    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    stbi_image_free(data);
}
else
{
    std::cout << "Failed to load HDR image." << std::endl;
}
```

##### 从等距柱状投影到立方体贴图

要将等距柱状投影图转换为立方体贴图，需要渲染一个（单位）立方体，并从内部将等距柱状图投影到立方体的每个面，并将立方体的六个面的图像构造成立方体贴图

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

out vec3 localPos;

uniform mat4 projection;
uniform mat4 view;

void main()
{
    localPos = aPos;
    gl_Position =  projection * view * vec4(localPos, 1.0);
}
```

```cpp
#version 330 core
out vec4 FragColor;
in vec3 localPos;

uniform sampler2D equirectangularMap;

const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 SampleSphericalMap(vec3 v)
{
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}

void main()
{
    vec2 uv = SampleSphericalMap(normalize(localPos)); // make sure to normalize localPos
    vec3 color = texture(equirectangularMap, uv).rgb;

    FragColor = vec4(color, 1.0);
}

```

![img](https://learnopengl-cn.github.io/img/07/03/01/ibl_equirectangular_projection.png)

对同一个立方体渲染六次，每次面对立方体的一个面，并用帧缓冲对象记录其结果

```cpp
unsigned int captureFBO, captureRBO;
glGenFramebuffers(1, &captureFBO);
glGenRenderbuffers(1, &captureRBO);

glBindFramebuffer(GL_FRAMEBUFFER, captureFBO);
glBindRenderbuffer(GL_RENDERBUFFER, captureRBO);
glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, 512, 512);
glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, captureRBO);
```

```cpp
unsigned int envCubemap;
glGenTextures(1, &envCubemap);
glBindTexture(GL_TEXTURE_CUBE_MAP, envCubemap);
for (unsigned int i = 0; i < 6; ++i)
{
    // note that we store each face with 16 bit floating point values
    glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGB16F,
                 512, 512, 0, GL_RGB, GL_FLOAT, nullptr);
}
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

```cpp
glm::mat4 captureProjection = glm::perspective(glm::radians(90.0f), 1.0f, 0.1f, 10.0f);
glm::mat4 captureViews[] =
{
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3( 1.0f,  0.0f,  0.0f), glm::vec3(0.0f, -1.0f,  0.0f)),
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3(-1.0f,  0.0f,  0.0f), glm::vec3(0.0f, -1.0f,  0.0f)),
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3( 0.0f,  1.0f,  0.0f), glm::vec3(0.0f,  0.0f,  1.0f)),
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3( 0.0f, -1.0f,  0.0f), glm::vec3(0.0f,  0.0f, -1.0f)),
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3( 0.0f,  0.0f,  1.0f), glm::vec3(0.0f, -1.0f,  0.0f)),
   glm::lookAt(glm::vec3(0.0f, 0.0f, 0.0f), glm::vec3( 0.0f,  0.0f, -1.0f), glm::vec3(0.0f, -1.0f,  0.0f))
};

// convert HDR equirectangular environment map to cubemap equivalent
equirectangularToCubemapShader.use();
equirectangularToCubemapShader.setInt("equirectangularMap", 0);
equirectangularToCubemapShader.setMat4("projection", captureProjection);
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, hdrTexture);

glViewport(0, 0, 512, 512); // don't forget to configure the viewport to the capture dimensions.
glBindFramebuffer(GL_FRAMEBUFFER, captureFBO);
for (unsigned int i = 0; i < 6; ++i)
{
    equirectangularToCubemapShader.setMat4("view", captureViews[i]);
    glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                           GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, envCubemap, 0);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    renderCube(); // renders a 1x1 cube
}
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

```cpp
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 projection;
uniform mat4 view;

out vec3 localPos;

void main()
{
    localPos = aPos;

    mat4 rotView = mat4(mat3(view)); 	// remove translation from the view matrix
    vec4 clipPos = projection * rotView * vec4(localPos, 1.0);

    gl_Position = clipPos.xyww;			// 确保立方体片段深度值总是1.0
}
```

```cpp
glDepthFunc(GL_LEQUAL);
```

```cpp
#version 330 core
out vec4 FragColor;

in vec3 localPos;

uniform samplerCube environmentMap;

void main()
{
    vec3 envColor = texture(environmentMap, localPos).rgb;

    envColor = envColor / (envColor + vec3(1.0));
    envColor = pow(envColor, vec3(1.0/2.2));

    FragColor = vec4(envColor, 1.0);
}
```

##### 立方体贴图的卷积

为了模拟半球积分，先进行坐标变换来简化计算

![img](https://learnopengl-cn.github.io/img/07/03/01/ibl_spherical_integrate.png)

$$
L_o(p,\phi_o, \theta_o) =
        k_d\frac{c}{\pi} \int_{\phi = 0}^{2\pi} \int_{\theta = 0}^{\frac{1}{2}\pi} L_i(p,\phi_i, \theta_i) \cos(\theta) \sin(\theta)  d\phi d\theta
$$

随后引入蒙特卡洛积分进行求解

$$
L_o(p,\phi_o, \theta_o) =
        k_d \frac{c\pi}{n1 n2} \sum_{\phi = 0}^{n1} \sum_{\theta = 0}^{n2} L_i(p,\phi_i, \theta_i) \cos(\theta) \sin(\theta)  d\phi d\theta
$$

```cpp
vec3 irradiance = vec3(0.0);

vec3 up    = vec3(0.0, 1.0, 0.0);
vec3 right = normalize(cross(up, normal));
up         = normalize(cross(normal, right));

float sampleDelta = 0.025;
float nrSamples = 0.0;
for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
{
    for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
    {
        // spherical to cartesian (in tangent space)
        vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
        // tangent space to world
        vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N;

        irradiance += texture(environmentMap, sampleVec).rgb * cos(theta) * sin(theta);
        nrSamples++;
    }
}
irradiance = PI * irradiance * (1.0 / float(nrSamples));
```

其中，采样的颜色值乘以系数 cos(θ) ，因为较大角度的光较弱；而系数 sin(θ) 则用于平衡较高半球区域中较小采样区域的贡献度。

随后用相同的方式生成 Irradiance map

##### PBR 和间接辐照度光照

最终，需要对生成的 Irradiance map 进行采样

```cpp
uniform samplerCube irradianceMap;

// vec3 ambient = vec3(0.03);
vec3 ambient = texture(irradianceMap, N).rgb;
```

```cpp
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}
```

```cpp
vec3 kS = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);
vec3 kD = 1.0 - kS;
vec3 irradiance = texture(irradianceMap, N).rgb;
vec3 diffuse    = irradiance * albedo;
vec3 ambient    = (kD * diffuse) * ao;
```

#### Specular IBL

从公式发现，镜面反射 IBL 部分，受到 wi 和 wo 两个变量影响，因而无法像漫反射一样直接从贴图中采样

$$
L_o(p,\omega_o) =
        \int\limits_{\Omega} (k_s\frac{DFG}{4(\omega_o \cdot n)(\omega_i \cdot n)}
            L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
            =
        \int\limits_{\Omega} f_r(p, \omega_i, \omega_o) L_i(p,\omega_i) n \cdot \omega_i  d\omega_i
$$

为此需要将积分拆项，将原式拆成仅包含 wi 项的 pre-filtered environment map 和镜面反射的 BRDF 部分

$$
L_o(p,\omega_o) =
        \int\limits_{\Omega} L_i(p,\omega_i) d\omega_i
        *
        \int\limits_{\Omega} f_r(p, \omega_i, \omega_o) n \cdot \omega_i d\omega_i
$$

##### 对于第一部分（左侧），其类似于漫反射的 irradiance map，唯一区别是此时考虑了粗糙度 α

因为随着粗糙度的增加，参与环境贴图卷积的采样向量会更分散，导致反射更模糊，所以对于卷积的每个粗糙度级别，我们将按顺序把模糊后的结果存储在预滤波贴图的 mipmap 中

在 Cook-Torrance BRDF 中，假设视角方向总是等于输出采样方向 ωo，这样，预过滤的环境卷积就不需要关心视角方向了

![Pre-convoluted environment map over 5 roughness levels for PBR](https://learnopengl.com/img/pbr/ibl_prefilter_map.png)

##### 对于第二部分，将预计算好的 BRDF 对每个粗糙度和入射角的组合的响应结果存储在一张 2D 查找纹理(LUT)上，称为 BRDF 积分贴图

2D-LUT 中，菲涅耳响应的系数存储于 R 通道和偏差值存储于 G 通道

![img](https://learnopengl-cn.github.io/img/07/03/02/ibl_brdf_lut.png)

最终对两者相乘即可得到镜面反射积分的结果：

```cpp
float lod             = getMipLevelFromRoughness(roughness);
vec3 prefilteredColor = textureCubeLod(PrefilteredEnvMap, refVec, lod);
vec2 envBRDF          = texture2D(BRDFIntegrationMap, vec2(NdotV, roughness)).xy;
vec3 indirectSpecular = prefilteredColor * (F * envBRDF.x + envBRDF.y) 		//.x 菲涅尔项 .y 偏差值
```

##### 预滤波 HDR 环境贴图（pre-filtered environment map）

整体与漫反射部分内存申请相似，区别是：每面大小采用 128x128，大多数情况够用，此外缩小情况采用三线性过滤

```cpp
unsigned int prefilterMap;
glGenTextures(1, &prefilterMap);
glBindTexture(GL_TEXTURE_CUBE_MAP, prefilterMap);
for (unsigned int i = 0; i < 6; ++i)
{
    glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGB16F, 128, 128, 0, GL_RGB, GL_FLOAT, nullptr);
}
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

glGenerateMipmap(GL_TEXTURE_CUBE_MAP);
```

![img](https://learnopengl-cn.github.io/img/07/03/02/ibl_specular_lobe.png)

另一区别是，漫反射是对整个半球采样，而镜面发射存在一个镜面波瓣（specular lobe）现象，即出射光方向为**基于微表面半程向量方向**的一个范围内，为了避免采样的浪费，引入重要性采样（importance sampling）

##### 蒙特卡洛积分

$$
O =  \int\limits_{a}^{b} f(x) dx       =       \frac{1}{N} \sum_{i=0}^{N-1} \frac{f(x)}{pdf(x)}
$$

蒙特卡洛积分是求积分的近似值，即通过对函数多次采样求平均值，当采样次数很大时，其值近似于积分的值

为了避免采样不均匀，会对每个采样值除以其位置的概率密度函数 pdf，从而降低高频率部分的权重

##### 低差异序列

由蒙特卡洛积分过程可发现，其值与采样方式存在一定关联，在此引入低差异序列（low-discrepancy sequences ）的采样方式，加快积分收敛速度

![img](https://learnopengl-cn.github.io/img/07/03/02/ibl_low_discrepancy_sequence.png)

我们将使用的序列被称为 **Hammersley** 序列，**Hammersley** 序列是基于 **Van Der Corput** 序列，该序列是把十进制数字的二进制表示镜像翻转到小数点右边而得。

```cpp
float RadicalInverse_VdC(uint bits)
{
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}
// ----------------------------------------------------------------------------
vec2 Hammersley(uint i, uint N)
{
    return vec2(float(i)/float(N), RadicalInverse_VdC(i));
}
```

##### GGX 重要性采样

重要性采样采样会根据粗糙度，偏向微表面的半程向量的宏观反射方向

主要思路：由采样向量计算当前 theta 和 phi 角度，随后其从球坐标转换为直角坐标，再通过 TBN 从切线空间转换到世界空间

```cpp
vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness)
{
    float a = roughness*roughness;

    float phi = 2.0 * PI * Xi.x;
    float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));
    float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

    // from spherical coordinates to cartesian coordinates
    vec3 H;
    H.x = cos(phi) * sinTheta;
    H.y = sin(phi) * sinTheta;
    H.z = cosTheta;

    // from tangent-space vector to world-space sample vector
    vec3 up        = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent   = normalize(cross(up, N));
    vec3 bitangent = cross(N, tangent);

    vec3 sampleVec = tangent * H.x + bitangent * H.y + N * H.z;
    return normalize(sampleVec);
}
```

##### 结合低差异序列和重要性采样

```cpp
#version 330 core
out vec4 FragColor;
in vec3 localPos;

uniform samplerCube environmentMap;
uniform float roughness;

const float PI = 3.14159265359;

float RadicalInverse_VdC(uint bits);
vec2 Hammersley(uint i, uint N);
vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness);

void main()
{
    vec3 N = normalize(localPos);
    vec3 R = N;
    vec3 V = R;

    const uint SAMPLE_COUNT = 1024u;
    float totalWeight = 0.0;
    vec3 prefilteredColor = vec3(0.0);
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);	// 低差异序列的采样形式
        vec3 H  = ImportanceSampleGGX(Xi, N, roughness);	// 进行重要性采样
        vec3 L  = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(dot(N, L), 0.0);
        if(NdotL > 0.0)
        {
            prefilteredColor += texture(environmentMap, L).rgb * NdotL;
            totalWeight      += NdotL;
        }
    }
    prefilteredColor = prefilteredColor / totalWeight;

    FragColor = vec4(prefilteredColor, 1.0);
}

```

##### 捕获预过滤 mipmap 级别

让 OpenGL 在多个 mipmap 级别上以不同的粗糙度值预过滤环境贴图

```cpp
prefilterShader.use();
prefilterShader.setInt("environmentMap", 0);
prefilterShader.setMat4("projection", captureProjection);
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_CUBE_MAP, envCubemap);

glBindFramebuffer(GL_FRAMEBUFFER, captureFBO);
unsigned int maxMipLevels = 5;
for (unsigned int mip = 0; mip < maxMipLevels; ++mip)
{
    // reisze framebuffer according to mip-level size.
    unsigned int mipWidth  = 128 * std::pow(0.5, mip);
    unsigned int mipHeight = 128 * std::pow(0.5, mip);
    glBindRenderbuffer(GL_RENDERBUFFER, captureRBO);
    glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT24, mipWidth, mipHeight);
    glViewport(0, 0, mipWidth, mipHeight);

    float roughness = (float)mip / (float)(maxMipLevels - 1);
    prefilterShader.setFloat("roughness", roughness);
    for (unsigned int i = 0; i < 6; ++i)
    {
        prefilterShader.setMat4("view", captureViews[i]);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                               GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, prefilterMap, mip);
        // 注意，最后一个参数指定mipmap级别

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        renderCube();
    }
}
glBindFramebuffer(GL_FRAMEBUFFER, 0);
```

#### 预过滤卷积的伪像

##### 高粗糙度的立方体贴图接缝

<img src="https://learnopengl-cn.github.io/img/07/03/02/ibl_prefilter_seams.png" alt="img" style="zoom:67%;" />

```cpp
glEnable(GL_TEXTURE_CUBE_MAP_SEAMLESS); 	// 提供在立方体贴图的面之间进行正确过滤
```

##### 预过滤卷积的亮点

在某些较粗糙的 mip 级别上，采样不足，导致明亮区域周围出现点状图案：

<img src="https://learnopengl-cn.github.io/img/07/03/02/ibl_prefilter_dots.png" alt="img" style="zoom:67%;" />

这种情况可以在预过滤卷积时，不直接采样环境贴图，而是基于积分的 PDF 和粗糙度采样环境贴图的 mipmap

```cpp
float D   = DistributionGGX(NdotH, roughness);
float pdf = (D * NdotH / (4.0 * HdotV)) + 0.0001;

float resolution = 512.0; // resolution of source cubemap (per face)
float saTexel  = 4.0 * PI / (6.0 * resolution * resolution);
float saSample = 1.0 / (float(SAMPLE_COUNT) * pdf + 0.0001);

float mipLevel = roughness == 0.0 ? 0.0 : 0.5 * log2(saSample / saTexel);
```

#### 预计算 BRDF

思路：将菲涅尔系数提取出

$$
\int\limits_{\Omega} f_r(p, \omega_i, \omega_o) n \cdot \omega_i d\omega_i = \int\limits_{\Omega} f_r(p, \omega_i, \omega_o) \frac{F(\omega_o, h)}{F(\omega_o, h)} n \cdot \omega_i d\omega_i
$$

$$
\int\limits_{\Omega} \frac{f_r(p, \omega_i, \omega_o)}{F(\omega_o, h)} F(\omega_o, h)  n \cdot \omega_i d\omega_i
$$

$$
\int\limits_{\Omega} \frac{f_r(p, \omega_i, \omega_o)}{F(\omega_o, h)} (F_0 + (1 - F_0){(1 - \omega_o \cdot h)}^5)  n \cdot \omega_i d\omega_i
$$

$$
F_0 \int\limits_{\Omega} f_r'(p, \omega_i, \omega_o)(1 - {(1 - \omega_o \cdot h)}^5)  n \cdot \omega_i d\omega_i
              +
    \int\limits_{\Omega} f_r'(p, \omega_i, \omega_o) {(1 - \omega_o \cdot h)}^5  n \cdot \omega_i d\omega_i
$$

公式中的两个积分分别表示 F0 的比例和偏差，注意，此时 fr ‘ 表示的是约去 F 后的部分

```cpp
vec2 IntegrateBRDF(float NdotV, float roughness)
{
    vec3 V;
    V.x = sqrt(1.0 - NdotV*NdotV);
    V.y = 0.0;
    V.z = NdotV;

    float A = 0.0;
    float B = 0.0;

    vec3 N = vec3(0.0, 0.0, 1.0);

    const uint SAMPLE_COUNT = 1024u;
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        vec2 Xi = Hammersley(i, SAMPLE_COUNT);
        vec3 H  = ImportanceSampleGGX(Xi, N, roughness);
        vec3 L  = normalize(2.0 * dot(V, H) * H - V);

        float NdotL = max(L.z, 0.0);
        float NdotH = max(H.z, 0.0);
        float VdotH = max(dot(V, H), 0.0);

        if(NdotL > 0.0)
        {
            float G = GeometrySmith(N, V, L, roughness);
            float G_Vis = (G * VdotH) / (NdotH * NdotV);
            float Fc = pow(1.0 - VdotH, 5.0);

            A += (1.0 - Fc) * G_Vis;
            B += Fc * G_Vis;
        }
    }
    A /= float(SAMPLE_COUNT);
    B /= float(SAMPLE_COUNT);
    return vec2(A, B);
}
// ----------------------------------------------------------------------------
void main()
{
    vec2 integratedBRDF = IntegrateBRDF(TexCoords.x, TexCoords.y);
    FragColor = integratedBRDF;
}
```

```cpp
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float a = roughness;
    float k = (a * a) / 2.0;	// 镜面反射形式

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
```

## 实战

### 调试

#### glGetError()

```cpp
GLenum glGetError();
```

| 标记                             | 代码 | 描述                                              |
| :------------------------------- | :--- | :------------------------------------------------ |
| GL_NO_ERROR                      | 0    | 自上次调用 glGetError 以来没有错误                |
| GL_INVALID_ENUM                  | 1280 | 枚举参数不合法                                    |
| GL_INVALID_VALUE                 | 1281 | 值参数不合法                                      |
| GL_INVALID_OPERATION             | 1282 | 一个指令的状态对指令的参数不合法                  |
| GL_STACK_OVERFLOW                | 1283 | 压栈操作造成栈上溢(Overflow)                      |
| GL_STACK_UNDERFLOW               | 1284 | 弹栈操作时栈在最低点（译注：即栈下溢(Underflow)） |
| GL_OUT_OF_MEMORY                 | 1285 | 内存调用操作无法调用（足够的）内存                |
| GL_INVALID_FRAMEBUFFER_OPERATION | 1286 | 读取或写入一个不完整的帧缓冲                      |

当`glGetError`被调用的时候，它会清除所有的错误标记

注意当 OpenGL 是分布式(Distributely)运行的时候，如在 X11 系统上，其它的用户错误代码仍然可以被生成，只要它们有着不同的错误代码。调用 glGetError 只会重置一个错误代码标记，而不是所有。由于这一点，我们通常会建议在一个循环中调用 glGetError。

```cpp
glBindTexture(GL_TEXTURE_2D, tex);
std::cout << glGetError() << std::endl; // 返回 0 (无错误)

glTexImage2D(GL_TEXTURE_3D, 0, GL_RGB, 512, 512, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
std::cout << glGetError() << std::endl; // 返回 1280 (非法枚举)

glGenTextures(-5, textures);
std::cout << glGetError() << std::endl; // 返回 1281 (非法值)

std::cout << glGetError() << std::endl; // 返回 0 (无错误)
```

通常`glGetError()`返回一个数字，为了清晰化，写一个助手函数

```cpp
GLenum glCheckError_(const char *file, int line)
{
    GLenum errorCode;
    while ((errorCode = glGetError()) != GL_NO_ERROR)
    {
        std::string error;
        switch (errorCode)
        {
            case GL_INVALID_ENUM:                  error = "INVALID_ENUM"; break;
            case GL_INVALID_VALUE:                 error = "INVALID_VALUE"; break;
            case GL_INVALID_OPERATION:             error = "INVALID_OPERATION"; break;
            case GL_STACK_OVERFLOW:                error = "STACK_OVERFLOW"; break;
            case GL_STACK_UNDERFLOW:               error = "STACK_UNDERFLOW"; break;
            case GL_OUT_OF_MEMORY:                 error = "OUT_OF_MEMORY"; break;
            case GL_INVALID_FRAMEBUFFER_OPERATION: error = "INVALID_FRAMEBUFFER_OPERATION"; break;
        }
        std::cout << error << " | " << file << " (" << line << ")" << std::endl;
    }
    return errorCode;
}
#define glCheckError() glCheckError_(__FILE__, __LINE__) 	//__FILE__、__LINE__在编译期间会替换为对应的文件和行号
```

![img](https://learnopengl-cn.github.io/img/06/01/debugging_glgeterror.png)

不过`glGetError()`只能提供简单的信息

#### 调试输出(Debug Output)

在 4.3 版本后该功能成为 OpenGL 的一部分，在此之前版本需要查询`ARB_debug_output`或者`AMD_debug_output`拓展来获取它的功能

```cpp
glfwWindowHint(GLFW_OPENGL_DEBUG_CONTEXT, GL_TRUE);
```

```cpp
GLint flags; glGetIntegerv(GL_CONTEXT_FLAGS, &flags);
if (flags & GL_CONTEXT_FLAG_DEBUG_BIT)
{
    // 初始化调试输出
}
```

##### GLFW 调试输出

采用以下回调函数可以自由处理错误信息的输出

```cpp
void APIENTRY glDebugOutput(GLenum source,
                            GLenum type,
                            GLuint id,
                            GLenum severity,
                            GLsizei length,
                            const GLchar *message,
                            void *userParam)
{
    // 忽略一些不重要的错误/警告代码
    if(id == 131169 || id == 131185 || id == 131218 || id == 131204) return;

    std::cout << "---------------" << std::endl;
    std::cout << "Debug message (" << id << "): " <<  message << std::endl;

    switch (source)
    {
        case GL_DEBUG_SOURCE_API:             std::cout << "Source: API"; break;
        case GL_DEBUG_SOURCE_WINDOW_SYSTEM:   std::cout << "Source: Window System"; break;
        case GL_DEBUG_SOURCE_SHADER_COMPILER: std::cout << "Source: Shader Compiler"; break;
        case GL_DEBUG_SOURCE_THIRD_PARTY:     std::cout << "Source: Third Party"; break;
        case GL_DEBUG_SOURCE_APPLICATION:     std::cout << "Source: Application"; break;
        case GL_DEBUG_SOURCE_OTHER:           std::cout << "Source: Other"; break;
    } std::cout << std::endl;

    switch (type)
    {
        case GL_DEBUG_TYPE_ERROR:               std::cout << "Type: Error"; break;
        case GL_DEBUG_TYPE_DEPRECATED_BEHAVIOR: std::cout << "Type: Deprecated Behaviour"; break;
        case GL_DEBUG_TYPE_UNDEFINED_BEHAVIOR:  std::cout << "Type: Undefined Behaviour"; break;
        case GL_DEBUG_TYPE_PORTABILITY:         std::cout << "Type: Portability"; break;
        case GL_DEBUG_TYPE_PERFORMANCE:         std::cout << "Type: Performance"; break;
        case GL_DEBUG_TYPE_MARKER:              std::cout << "Type: Marker"; break;
        case GL_DEBUG_TYPE_PUSH_GROUP:          std::cout << "Type: Push Group"; break;
        case GL_DEBUG_TYPE_POP_GROUP:           std::cout << "Type: Pop Group"; break;
        case GL_DEBUG_TYPE_OTHER:               std::cout << "Type: Other"; break;
    } std::cout << std::endl;

    switch (severity)
    {
        case GL_DEBUG_SEVERITY_HIGH:         std::cout << "Severity: high"; break;
        case GL_DEBUG_SEVERITY_MEDIUM:       std::cout << "Severity: medium"; break;
        case GL_DEBUG_SEVERITY_LOW:          std::cout << "Severity: low"; break;
        case GL_DEBUG_SEVERITY_NOTIFICATION: std::cout << "Severity: notification"; break;
    } std::cout << std::endl;
    std::cout << std::endl;
}
```

##### 过滤调试输出

```cpp
glDebugMessageControl(GL_DEBUG_SOURCE_API,
                      GL_DEBUG_TYPE_ERROR,
                      GL_DEBUG_SEVERITY_HIGH,
                      0, nullptr, GL_TRUE);
```

#### OpenGL GLSL 参考编译器

可以直接对着官方的标准使用 OpenGL 的 GLSL[参考编译器](https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/)（Reference Compiler）来检查

可以从[这里](https://www.khronos.org/opengles/sdk/tools/Reference-Compiler/)下载所谓的 GLSL 语言校验器(GLSL Lang Validator)的可执行版本，或者从[这里](https://github.com/KhronosGroup/glslang)找到完整的源码

```cpp
glsllangvalidator shaderFile.vert
```

- **.vert**：顶点着色器(Vertex Shader)
- **.frag**：片段着色器(Fragment Shader)
- **.geom**：几何着色器(Geometry Shader)
- **.tesc**：细分控制着色器(Tessellation Control Shader)
- **.tese**：细分计算着色器(Tessellation Evaluation Shader)
- **.comp**：计算着色器(Compute Shader)

用于检查 GLSL 是否符合规范

#### 检查帧缓冲纹理

写一个建议着色器，把贴图直接渲染在屏幕右上角

```cpp
// 顶点着色器
#version 330 core
layout (location = 0) in vec2 position;
layout (location = 1) in vec2 texCoords;

out vec2 TexCoords;

void main()
{
    gl_Position = vec4(position, 0.0f, 1.0f);
    TexCoords = texCoords;
}

// 片段着色器
#version 330 core
out vec4 FragColor;
in  vec2 TexCoords;

uniform sampler2D fboAttachment;

void main()
{
    FragColor = texture(fboAttachment, TexCoords);
}
```

```cpp
void DisplayFramebufferTexture(GLuint textureID)
{
    if(!notInitialized)
    {
        // 在屏幕右上角，使用NDC顶点坐标初始化着色器和VAO
        [...]
    }

    glActiveTexture(GL_TEXTURE0);
    glUseProgram(shaderDisplayFBOOutput);
        glBindTexture(GL_TEXTURE_2D, textureID);
        glBindVertexArray(vaoDebugTexturedRect);
            glDrawArrays(GL_TRIANGLES, 0, 6);
        glBindVertexArray(0);
    glUseProgram(0);
}

int main()
{
    [...]
    while (!glfwWindowShouldClose(window))
    {
        [...]
        DisplayFramebufferTexture(fboAttachment0);

        glfwSwapBuffers(window);
    }
}
```

<img src="https://learnopengl-cn.github.io/img/06/01/debugging_fbo_output.png" alt="img" style="zoom:80%;" />

#### 第三方调试软件

**gDebugger**

**RenderDoc**

CodeXL（AMD）

NVIDIA Nsight(NVIDIA)
