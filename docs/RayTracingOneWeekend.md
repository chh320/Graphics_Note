# [Ray Tracing one weekend](https://raytracing.github.io/books/RayTracingInOneWeekend.html#overview)

### Overview

本课程使用 PPM 格式的图片输出，格式如下：

<img src="https://raytracing.github.io/images/fig-1.01-ppm.jpg" alt="img" style="zoom: 50%;" />

### The ray Class

$$
\mathbf{P}(t) = \mathbf{A} + t \mathbf{b}
$$

![img](https://raytracing.github.io/images/fig-1.02-lerp.jpg)

```cpp
#ifndef RAY_H
#define RAY_H

#include "vec3.h"

class ray {
    public:
        ray() {}
        ray(const point3& origin, const vec3& direction)
            : orig(origin), dir(direction)
        {}

        point3 origin() const  { return orig; }
        vec3 direction() const { return dir; }

        point3 at(double t) const {
            return orig + t*dir;
        }

    public:
        point3 orig;
        vec3 dir;
};

#endif
```

### Sending Rays Into the Scene

**预设：**viewport 的 Height 为 2 个单位，宽高比为 16：9，相机置于原点，Y-up，相机距离投影面 1 个单位，从左下角开始用两个向量进行遍历 screen

![img](https://raytracing.github.io/images/fig-1.03-cam-geom.jpg)

### Ray-Sphere Intersection

由于球体和射线的碰撞比较直观，因而考虑植入一个球体进行运算

假设球体中心为(Cx, Cy, Cz)，在数学中写成如下形式，但不够美观：

$$
(x - C_x)^2 + (y - C_y)^2 + (z - C_z)^2 = r^2
$$

在图形学中，总希望数据与向量有关，而点 C 到点 P 的向量可以用**（P-C）**表示，因而结合向量点乘：

$$
(\mathbf{P} - \mathbf{C}) \cdot (\mathbf{P} - \mathbf{C})
     = (x - C_x)^2 + (y - C_y)^2 + (z - C_z)^2
$$

$$
(\mathbf{P} - \mathbf{C}) \cdot (\mathbf{P} - \mathbf{C}) = r^2
$$

再引入射线方程替换变量：

$$
(\mathbf{P}(t) - \mathbf{C}) \cdot (\mathbf{P}(t) - \mathbf{C}) = r^2
$$

$$
(\mathbf{A} + t \mathbf{b} - \mathbf{C})
      \cdot (\mathbf{A} + t \mathbf{b} - \mathbf{C}) = r^2
$$

移项，求解 t 即可

$$
t^2 \mathbf{b} \cdot \mathbf{b}
     + 2t \mathbf{b} \cdot (\mathbf{A}-\mathbf{C})
     + (\mathbf{A}-\mathbf{C}) \cdot (\mathbf{A}-\mathbf{C}) - r^2 = 0
$$

<img src="https://raytracing.github.io/images/fig-1.04-ray-sphere.jpg" alt="img" style="zoom:80%;" />

若对上述求解公式进行硬编码：

```cpp
bool hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = r.origin() - center;
    auto a = dot(r.direction(), r.direction());
    auto b = 2.0 * dot(oc, r.direction());
    auto c = dot(oc, oc) - radius*radius;
    auto discriminant = b*b - 4*a*c;		// b^2 - 4ac
    return (discriminant > 0);				// 大于0表示有两个解，即两个交点
}
color ray_color(const ray& r) {
    if (hit_sphere(point3(0,0,-1), 0.5, r))	// 有两个交点处置红色
        return color(1, 0, 0);
    vec3 unit_direction = unit_vector(r.direction());
    auto t = 0.5*(unit_direction.y() + 1.0);
    return (1.0-t)*color(1.0, 1.0, 1.0) + t*color(0.5, 0.7, 1.0);
}
```

<img src="https://raytracing.github.io/images/img-1.03-red-sphere.png" alt="img"  />

### Shading with Surface Normals

球体的表面某点的法线方向即该点减去圆心所得的向量方向

![img](https://raytracing.github.io/images/fig-1.05-sphere-normal.jpg)

```cpp
double hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = r.origin() - center;
    auto a = dot(r.direction(), r.direction());
    auto b = 2.0 * dot(oc, r.direction());
    auto c = dot(oc, oc) - radius*radius;
    auto discriminant = b*b - 4*a*c;
    if (discriminant < 0) {
        return -1.0;
    } else {
        return (-b - sqrt(discriminant) ) / (2.0*a);	// 求较小解，即更近的交点
    }
}

color ray_color(const ray& r) {
    auto t = hit_sphere(point3(0,0,-1), 0.5, r);
    if (t > 0.0) {										// 由于已知球体在眼前，t若存在，必大于0
        vec3 N = unit_vector(r.at(t) - vec3(0,0,-1));
        return 0.5*color(N.x()+1, N.y()+1, N.z()+1);
    }
    vec3 unit_direction = unit_vector(r.direction());
    t = 0.5*(unit_direction.y() + 1.0);
    return (1.0-t)*color(1.0, 1.0, 1.0) + t*color(0.5, 0.7, 1.0);
}
```

![img](https://raytracing.github.io/images/img-1.04-normals-sphere.png)

### Simplifying the Ray-Sphere Intersection Code

$$
t^2 \mathbf{b} \cdot \mathbf{b}
     + 2t \mathbf{b} \cdot (\mathbf{A}-\mathbf{C})
     + (\mathbf{A}-\mathbf{C}) \cdot (\mathbf{A}-\mathbf{C}) - r^2 = 0
$$

由上式分别计算出**a、b、c：**

$$
a = \mathbf{b} \cdot \mathbf{b} \\
b = 2*\mathbf{b} \cdot (\mathbf{A}-\mathbf{C}) \\
c = (\mathbf{A}-\mathbf{C}) \cdot (\mathbf{A}-\mathbf{C}) - r^2
$$

可以发现 **b** 项中存在一个因子 **2**，若令 **b = 2h**：

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

$$
= \frac{-2h \pm \sqrt{(2h)^2 - 4ac}}{2a}
$$

$$
= \frac{-2h \pm 2\sqrt{h^2 - ac}}{2a}
$$

$$
= \frac{-h \pm \sqrt{h^2 - ac}}{a}
$$

从而代码简化为：

```cpp
double hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = r.origin() - center;
    auto a = r.direction().length_squared();
    auto half_b = dot(oc, r.direction());
    auto c = oc.length_squared() - radius*radius;
    auto discriminant = half_b*half_b - a*c;

    if (discriminant < 0) {
        return -1.0;
    } else {
        return (-half_b - sqrt(discriminant) ) / a;
    }
}
```

### An Abstraction for Hittable Objects

在本课程中，统一将被击中的物体称为 `hittable` 的一种抽象类

该类接受一个 ray 参数，tmin，tmax

```cpp
// hittable.h
#ifndef HITTABLE_H
#define HITTABLE_H

#include "ray.h"

struct hit_record {
    point3 p;
    vec3 normal;
    double t;
};

class hittable {
    public:
        virtual bool hit(const ray& r, double t_min, double t_max, hit_record& rec) const = 0;
};

#endif
```

以 sphere 类为例

```cpp
// sphere.h
#ifndef SPHERE_H
#define SPHERE_H

#include "hittable.h"
#include "vec3.h"

class sphere : public hittable {
    public:
        sphere() {}
        sphere(point3 cen, double r) : center(cen), radius(r) {};

        virtual bool hit(
            const ray& r, double t_min, double t_max, hit_record& rec) const override;

    public:
        point3 center;
        double radius;
};

bool sphere::hit(const ray& r, double t_min, double t_max, hit_record& rec) const {
    vec3 oc = r.origin() - center;
    auto a = r.direction().length_squared();
    auto half_b = dot(oc, r.direction());
    auto c = oc.length_squared() - radius*radius;

    auto discriminant = half_b*half_b - a*c;
    if (discriminant < 0) return false;
    auto sqrtd = sqrt(discriminant);

    // Find the nearest root that lies in the acceptable range.
    auto root = (-half_b - sqrtd) / a;
    if (root < t_min || t_max < root) {
        root = (-half_b + sqrtd) / a;
        if (root < t_min || t_max < root)
            return false;
    }

    rec.t = root;
    rec.p = r.at(rec.t);
    rec.normal = (rec.p - center) / radius;

    return true;
}

#endif
```

### Front Faces Versus Back Faces

![img](https://raytracing.github.io/images/fig-1.06-normal-sides.jpg)

由于 surface 有正反面，设定面的法线方向就有两种策略

第一种是法线始终指向物体外部，则射线与法线间位置关系如下判断：

```cpp
if (dot(ray_direction, outward_normal) > 0.0) {
    // ray is inside the sphere
    ...
} else {
    // ray is outside the sphere
    ...
}
```

第二种是令法线始终指向射线的来源方向

```cpp
bool front_face;
if (dot(ray_direction, outward_normal) > 0.0) {
    // ray is inside the sphere
    normal = -outward_normal;
    front_face = false;
} else {
    // ray is outside the sphere
    normal = outward_normal;
    front_face = true;
}
```

两种策略取决于你是在计算几何相交，还是在计算着色

在本课程，材质类型远多于几何类型，因此为了减少工作量，将策略取决于几何（偏好而已）

```cpp
// hittable.h
struct hit_record {
    point3 p;
    vec3 normal;
    double t;
    bool front_face;

    // 判断若是从外部击中，则front_face = true，法线 = outward_normal
    inline void set_face_normal(const ray& r, const vec3& outward_normal) {
        front_face = dot(r.direction(), outward_normal) < 0;
        normal = front_face ? outward_normal :-outward_normal;
    }
};
```

### A List of Hittable Objects

`hittable_list` 类主要是将所有 object 存入一个 vector，随后依次比较是否存在交点，通过不断更新`closest_so_far`，最终可获得一个离得最近的交点

```cpp
// hittable_list.h
#ifndef HITTABLE_LIST_H
#define HITTABLE_LIST_H

#include "hittable.h"

#include <memory>
#include <vector>

using std::shared_ptr;
using std::make_shared;

class hittable_list : public hittable {
    public:
        hittable_list() {}
        hittable_list(shared_ptr<hittable> object) { add(object); }

        void clear() { objects.clear(); }
        void add(shared_ptr<hittable> object) { objects.push_back(object); }

        virtual bool hit(
            const ray& r, double t_min, double t_max, hit_record& rec) const override;

    public:
        std::vector<shared_ptr<hittable>> objects;
};

bool hittable_list::hit(const ray& r, double t_min, double t_max, hit_record& rec) const {
    hit_record temp_rec;
    bool hit_anything = false;
    auto closest_so_far = t_max;

    for (const auto& object : objects) {
        if (object->hit(r, t_min, closest_so_far, temp_rec)) {
            hit_anything = true;
            closest_so_far = temp_rec.t;
            rec = temp_rec;
        }
    }

    return hit_anything;
}

#endif
```

其中 `shared_ptr` 是基于 C++特性的智能指针，每个智能指针指向一个存储数据的内存和引用的指针数 count，当 count 为 0，自动 delete 该指针，从而能避免手动释放内存，具体可看[这个网站](https://blog.csdn.net/shaosunrise/article/details/85228823?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166546427716781432922292%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166546427716781432922292&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-85228823-null-null.142^v52^control,201^v3^control_1&utm_term=shared_ptr&spm=1018.2226.3001.4187)

```cpp
shared_ptr<double> double_ptr = make_shared<double>(0.37);
auto double_ptr = make_shared<double>(0.37);				// 和上句等价
```

通常使用 `make_shared` 申请智能指针，可避免申请过程中造成的内存错误

### Antialiasing
需要先准备可提供随机数的效用函数，以供后续随即采样使用

注意，随机数的范围在 **[0, 1)，左闭右开**，从而确保了采样点不会重复

```cpp
#include <cstdlib>
...

inline double random_double() {
    // Returns a random real in [0,1).
    return rand() / (RAND_MAX + 1.0);
}

inline double random_double(double min, double max) {
    // Returns a random real in [min,max).
    return min + (max-min)*random_double();
}
```

在新的C++特性中，引入了<random>头文件，可直接获得随机数

```cpp
#include <random>

inline double random_double() {
    static std::uniform_real_distribution<double> distribution(0.0, 1.0);
    static std::mt19937 generator;
    return distribution(generator);
}
```

#### Generating Pixels with Multiple Samples

![img](https://raytracing.github.io/images/fig-1.07-pixel-samples.jpg)

在每一个[i, j]位置，分别随机采样`samples_per_pixel`个点，记录总color，在输出前除以样本数获得平均值

```cpp
for (int j = image_height-1; j >= 0; --j) {
        std::cerr << "\rScanlines remaining: " << j << ' ' << std::flush;
        for (int i = 0; i < image_width; ++i) {
            color pixel_color(0, 0, 0);
            for (int s = 0; s < samples_per_pixel; ++s) {
                auto u = (i + random_double()) / (image_width-1);
                auto v = (j + random_double()) / (image_height-1);
                ray r = cam.get_ray(u, v);
                pixel_color += ray_color(r, world);
            }
            write_color(std::cout, pixel_color, samples_per_pixel);
        }
    }
```

### Diffuse Materials

对于漫反射材质，相同的入射光线往往有着不同的反射效果

<img src="https://raytracing.github.io/images/fig-1.08-light-bounce.jpg" alt="img" style="zoom:67%;" />

以入射光线与物体表面的交点出发，随机选择一个相切单位圆内的一点方向进行出射光线，进而模拟漫反射的无规则过程

<img src="https://raytracing.github.io/images/fig-1.09-rand-vec.jpg" alt="img" style="zoom: 50%;" />

采用一个递归的求色彩值过程，若随机选择的出射光线遇到物体，则继续漫反射，直到不再遇到物体，或者超过弹射的上限，返回颜色值

```cpp
color ray_color(const ray& r, const hittable& world, int depth) {	// depth为弹射上限
    hit_record rec;

    // If we've exceeded the ray bounce limit, no more light is gathered.
    if (depth <= 0)
        return color(0,0,0);

    if (world.hit(r, 0.001, infinity, rec)) {	// t_min设0.001避免计算点存在浮点误差，即t = -0.00001 等情况造成物体表面着色问题
        point3 target = rec.p + rec.normal + random_in_unit_sphere();
        return 0.5 * ray_color(ray(rec.p, target - rec.p), world, depth-1);
    }

    vec3 unit_direction = unit_vector(r.direction());
    auto t = 0.5*(unit_direction.y() + 1.0);
    return (1.0-t)*color(1.0, 1.0, 1.0) + t*color(0.5, 0.7, 1.0);
}
```

![img](https://raytracing.github.io/images/img-1.08-gamma-correct.png)

#### True Lambertian Reflection

拒绝法获取相切单位**球内点**的方式等价于使射线的方向更大概率靠近法线，更小概率掠射

但真正的Lambertian 散射概率更接近于正太，但他的分布更加均匀，它的方法是在相切单位**球表面**进行随机取点

![img](https://raytracing.github.io/images/fig-1.10-rand-unitvec.png)

```cpp
vec3 random_unit_vector() {
    return unit_vector(random_in_unit_sphere());
}
```

### Metal

```cpp
#ifndef MATERIAL_H
#define MATERIAL_H

#include "rtweekend.h"

struct hit_record;

class material {
    public:
        virtual bool scatter(
            const ray& r_in, const hit_record& rec, color& attenuation, ray& scattered
        ) const = 0;
};

#endif
```

![img](https://raytracing.github.io/images/fig-1.11-reflection.jpg)

由图观察，反射向量 = **v + 2 b**， 由于**v · n** 为负值，因而公式改为 **-2 * (v · n) * n**

```cpp
vec3 reflect(const vec3& v, const vec3& n) {
    return v - 2*dot(v,n)*n;
}
```

定义一个金属类，重写scatter函数，计算对应的反射光线

```cpp
class metal : public material {
    public:
        metal(const color& a) : albedo(a) {}

        virtual bool scatter(
            const ray& r_in, const hit_record& rec, color& attenuation, ray& scattered
        ) const override {
            vec3 reflected = reflect(unit_vector(r_in.direction()), rec.normal);
            scattered = ray(rec.p, reflected);
            attenuation = albedo;
            return (dot(scattered.direction(), rec.normal) > 0);
        }

    public:
        color albedo;
};
```

`ray_color`函数通过调用交错点存储的材质信息，调用对应材质类的scatter方法，获取其反射方向，进而计算颜色

```cpp
color ray_color(const ray& r, const hittable& world, int depth) {
    hit_record rec;

    // If we've exceeded the ray bounce limit, no more light is gathered.
    if (depth <= 0)
        return color(0,0,0);

    if (world.hit(r, 0.001, infinity, rec)) {
        ray scattered;
        color attenuation;
        if (rec.mat_ptr->scatter(r, rec, attenuation, scattered))
            return attenuation * ray_color(scattered, world, depth-1);
        return color(0,0,0);
    }

    vec3 unit_direction = unit_vector(r.direction());
    auto t = 0.5*(unit_direction.y() + 1.0);
    return (1.0-t)*color(1.0, 1.0, 1.0) + t*color(0.5, 0.7, 1.0);
}
```

![img](https://raytracing.github.io/images/img-1.11-metal-shiny.png)



#### Fuzzy Reflection

也可以使用一个小球来为反射方向赋予一个随机值，从而生成一条新的出射向量

球越大，对反射方向的影响越大，因而可考虑引入一个球半径参数作为 fuzziness 的参数

问题：若sphere足够大，可能导致散射到表面之下。可以令表面直接吸收这些光

![img](https://raytracing.github.io/images/fig-1.12-reflect-fuzzy.jpg)

```cpp
class metal : public material {
    public:
        metal(const color& a, double f) : albedo(a), fuzz(f < 1 ? f : 1) {}	// fuzz半径

        virtual bool scatter(
            const ray& r_in, const hit_record& rec, color& attenuation, ray& scattered
        ) const override {
            vec3 reflected = reflect(unit_vector(r_in.direction()), rec.normal);
            scattered = ray(rec.p, reflected + fuzz*random_in_unit_sphere());	// 加上fuzz
            attenuation = albedo;
            return (dot(scattered.direction(), rec.normal) > 0);
        }

    public:
        color albedo;
        double fuzz;
};
```

![img](https://raytracing.github.io/images/img-1.12-metal-fuzz.png)



### Dielectrics

介质会产生反射光和折射光

#### Snell's Law

$$
\eta \cdot \sin\theta = \eta' \cdot \sin\theta'
$$

$$
\sin\theta' = \frac{\eta}{\eta'} \cdot \sin\theta
$$

![img](https://raytracing.github.io/images/fig-1.13-refraction.jpg)

假设折射光为 **R**，[详细推导](https://blog.csdn.net/MASILEJFOAISEGJIAE/article/details/104435265?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166556448716800184155716%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166556448716800184155716&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-2-104435265-null-null.142^v53^control,201^v3^control_1&utm_term=%E6%8A%98%E5%B0%84%E5%90%91%E9%87%8F%E8%AE%A1%E7%AE%97&spm=1018.2226.3001.4187)
$$
\mathbf{R'} = \mathbf{R'}_{\bot} + \mathbf{R'}_{\parallel}
$$

$$
\mathbf{R'}_{\bot} = \frac{\eta}{\eta'} (\mathbf{R} + \cos\theta \mathbf{n})
$$

$$
\mathbf{R'}_{\parallel} = -\sqrt{1 - |\mathbf{R'}_{\bot}|^2} \mathbf{n}
$$

$$
\mathbf{R'}_{\bot} =
     \frac{\eta}{\eta'} (\mathbf{R} + (\mathbf{-R} \cdot \mathbf{n}) \mathbf{n})
$$

```cpp
vec3 refract(const vec3& uv, const vec3& n, double etai_over_etat) {
    auto cos_theta = fmin(dot(-uv, n), 1.0);
    vec3 r_out_perp =  etai_over_etat * (uv + cos_theta*n);
    vec3 r_out_parallel = -sqrt(fabs(1.0 - r_out_perp.length_squared())) * n;
    return r_out_perp + r_out_parallel;
}
```

```cpp
class dielectric : public material {
    public:
        dielectric(double index_of_refraction) : ir(index_of_refraction) {}

        virtual bool scatter(
            const ray& r_in, const hit_record& rec, color& attenuation, ray& scattered
        ) const override {
            attenuation = color(1.0, 1.0, 1.0);
            double refraction_ratio = rec.front_face ? (1.0/ir) : ir;

            vec3 unit_direction = unit_vector(r_in.direction());
            vec3 refracted = refract(unit_direction, rec.normal, refraction_ratio);

            scattered = ray(rec.p, refracted);
            return true;
        }

    public:
        double ir; // Index of Refraction
};
```

![img](https://raytracing.github.io/images/img-1.14-glass-always-refract.png)

#### Total Internal Reflection

对于从高折射率介质到低折射率介质的过程中，存在一种全反射现象
$$
\sin\theta' = \frac{\eta}{\eta'} \cdot \sin\theta
$$
假设是从玻璃（η = 1.5）进入空气（η = 1.0）
$$
\sin\theta' = \frac{1.5}{1.0} \cdot \sin\theta
$$
显然，若等号右边值大于1.0，等式将不成立，即此时应为全反射
$$
\frac{1.5}{1.0} \cdot \sin\theta > 1.0
$$
换元
$$
\sin\theta  = \sqrt{1 - \cos^2\theta} \\
\cos\theta = \mathbf{R} \cdot \mathbf{n}
$$

```cpp
double cos_theta = fmin(dot(-unit_direction, rec.normal), 1.0);
double sin_theta = sqrt(1.0 - cos_theta*cos_theta);

if (refraction_ratio * sin_theta > 1.0) {
    // Must Reflect
    ...
} else {
    // Can Refract
    ...
}
```

#### Schlick Approximation

Schlick 近似值用于近似两个介质间镜面反射中的菲尼尔项
$$
R(θ) = R_0 + (1 - R_0)(1-cosθ)^5
$$

$$
R_0 = (\frac{n1-n2}{n1+n2})^2
$$

### Positionable Camera

![img](https://raytracing.github.io/images/fig-1.14-cam-view-geom.jpg)
$$
h = \tan(\frac{\theta}{2})
$$
相机的构造函数引入**fov视野和宽高比**，控制相机的观察范围

```cpp
camera(double vfov, double aspect_ratio) {
    auto theta = degrees_to_radians(vfov);
    auto h = tan(theta/2);
    auto viewport_height = 2.0 * h;
    auto viewport_width = aspect_ratio * viewport_height;

    auto focal_length = 1.0;

    origin = point3(0, 0, 0);
    horizontal = vec3(viewport_width, 0.0, 0.0);
    vertical = vec3(0.0, viewport_height, 0.0);
    lower_left_corner = origin - horizontal/2 - vertical/2 - vec3(0, 0, focal_length);
}
```

#### Positioning and Orienting the Camera

<img src="https://raytracing.github.io/images/fig-1.15-cam-view-dir.jpg" alt="img" style="zoom:80%;" />

![img](https://raytracing.github.io/images/fig-1.16-cam-view-up.jpg)

在新的坐标中，假设相机朝向 **-w** 方向，**vup** 默认为**（0，1，0）**，根据 cross 可求得 **u、v** 向量

继续引入**pos，lookat，vup**三个参数，控制相机的位置和观察方向

```cpp
camera(point3 lookfrom, point3 lookat, vec3   vup, double vfov, double aspect_ratio) {
    auto theta = degrees_to_radians(vfov);
    auto h = tan(theta/2);
    auto viewport_height = 2.0 * h;
    auto viewport_width = aspect_ratio * viewport_height;

    auto w = unit_vector(lookfrom - lookat);
    auto u = unit_vector(cross(vup, w));
    auto v = cross(w, u);

    origin = lookfrom;
    horizontal = viewport_width * u;
    vertical = viewport_height * v;
    lower_left_corner = origin - horizontal/2 - vertical/2 - w;
}
```

![img](https://raytracing.github.io/images/img-1.18-view-distant.png)

### Defocus Blur

大多数摄影师称其为 “景深”

相机镜头模型通常如下

![img](https://raytracing.github.io/images/fig-1.17-cam-lens.jpg)

为了简化问题，假设射线是从镜头出发，并射向聚焦平面

![img](https://raytracing.github.io/images/fig-1.18-cam-film-plane.jpg)

#### Generating Sample Rays

当光线从相机pos出发，不存在焦散，此时引入一个偏移量，令射线从以相机为center的一个圆盘范围内射出，即增大光圈大小

```cpp
vec3 random_in_unit_disk() {
    while (true) {
        auto p = vec3(random_double(-1,1), random_double(-1,1), 0);
        if (p.length_squared() >= 1) continue;
        return p;
    }
}
```

引入了**光圈大小aperture和焦点距离focus_dist**，此前一直假设焦点距离为1unit，现在需要等比调整，即对每个参数乘上focus_dist

```cpp
class camera {
    public:
        camera(
            point3 lookfrom,
            point3 lookat,
            vec3   vup,
            double vfov, // vertical field-of-view in degrees
            double aspect_ratio,
            double aperture,
            double focus_dist
        ) {
            auto theta = degrees_to_radians(vfov);
            auto h = tan(theta/2);
            auto viewport_height = 2.0 * h;
            auto viewport_width = aspect_ratio * viewport_height;

            w = unit_vector(lookfrom - lookat);
            u = unit_vector(cross(vup, w));
            v = cross(w, u);

            origin = lookfrom;
            horizontal = focus_dist * viewport_width * u;
            vertical = focus_dist * viewport_height * v;
            lower_left_corner = origin - horizontal/2 - vertical/2 - focus_dist*w;

            lens_radius = aperture / 2;
        }


        ray get_ray(double s, double t) const {
            vec3 rd = lens_radius * random_in_unit_disk();
            vec3 offset = u * rd.x() + v * rd.y();

            return ray(
                origin + offset,
                lower_left_corner + s*horizontal + t*vertical - origin - offset
            );
        }

    private:
        point3 origin;
        point3 lower_left_corner;
        vec3 horizontal;
        vec3 vertical;
        vec3 u, v, w;
        double lens_radius;
};
```

![img](https://raytracing.github.io/images/img-1.20-depth-of-field.png)

### A Final Render

```cpp
hittable_list random_scene() {
    hittable_list world;

    auto ground_material = make_shared<lambertian>(color(0.5, 0.5, 0.5));
    world.add(make_shared<sphere>(point3(0,-1000,0), 1000, ground_material));

    for (int a = -11; a < 11; a++) {
        for (int b = -11; b < 11; b++) {
            auto choose_mat = random_double();
            point3 center(a + 0.9*random_double(), 0.2, b + 0.9*random_double());

            if ((center - point3(4, 0.2, 0)).length() > 0.9) {
                shared_ptr<material> sphere_material;

                if (choose_mat < 0.8) {
                    // diffuse
                    auto albedo = color::random() * color::random();
                    sphere_material = make_shared<lambertian>(albedo);
                    world.add(make_shared<sphere>(center, 0.2, sphere_material));
                } else if (choose_mat < 0.95) {
                    // metal
                    auto albedo = color::random(0.5, 1);
                    auto fuzz = random_double(0, 0.5);
                    sphere_material = make_shared<metal>(albedo, fuzz);
                    world.add(make_shared<sphere>(center, 0.2, sphere_material));
                } else {
                    // glass
                    sphere_material = make_shared<dielectric>(1.5);
                    world.add(make_shared<sphere>(center, 0.2, sphere_material));
                }
            }
        }
    }

    auto material1 = make_shared<dielectric>(1.5);
    world.add(make_shared<sphere>(point3(0, 1, 0), 1.0, material1));

    auto material2 = make_shared<lambertian>(color(0.4, 0.2, 0.1));
    world.add(make_shared<sphere>(point3(-4, 1, 0), 1.0, material2));

    auto material3 = make_shared<metal>(color(0.7, 0.6, 0.5), 0.0);
    world.add(make_shared<sphere>(point3(4, 1, 0), 1.0, material3));

    return world;
}

int main() {

    // Image

    const auto aspect_ratio = 3.0 / 2.0;
    const int image_width = 1200;
    const int image_height = static_cast<int>(image_width / aspect_ratio);
    const int samples_per_pixel = 500;
    const int max_depth = 50;

    // World

    auto world = random_scene();

    // Camera

    point3 lookfrom(13,2,3);
    point3 lookat(0,0,0);
    vec3 vup(0,1,0);
    auto dist_to_focus = 10.0;
    auto aperture = 0.1;

    camera cam(lookfrom, lookat, vup, 20, aspect_ratio, aperture, dist_to_focus);

    // Render

    std::cout << "P3\n" << image_width << ' ' << image_height << "\n255\n";

    for (int j = image_height-1; j >= 0; --j) {
        ...
}
```

![img](https://raytracing.github.io/images/img-1.21-book1-final.jpg)
