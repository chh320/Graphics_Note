# [Ray Tracing one weekend](https://raytracing.github.io/books/RayTracingInOneWeekend.html#overview)

### Overview

本课程使用PPM格式的图片输出，格式如下：

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

**预设：**viewport的Height为2个单位，宽高比为16：9，相机置于原点，Y-up，相机距离投影面1个单位，从左下角开始用两个向量进行遍历screen

![img](https://raytracing.github.io/images/fig-1.03-cam-geom.jpg)

### Ray-Sphere Intersection

由于球体和射线的碰撞比较直观，因而考虑植入一个球体进行运算

假设球体中心为(Cx, Cy, Cz)，在数学中写成如下形式，但不够美观：
$$
(x - C_x)^2 + (y - C_y)^2 + (z - C_z)^2 = r^2
$$
在图形学中，总希望数据与向量有关，而点C到点P的向量可以用**（P-C）**表示，因而结合向量点乘：
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

该类接受一个ray参数，tmin，tmax

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

以sphere类为例

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

由于surface有正反面，设定面的法线方向就有两种策略

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

`hittable_list` 类主要是将所有object存入一个vector，随后依次比较是否存在交点，通过不断更新`closest_so_far`，最终可获得一个离得最近的交点

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

其中 `shared_ptr` 是基于C++特性的智能指针，每个智能指针指向一个存储数据的内存和引用的指针数count，当count为0，自动delete该指针，从而能避免手动释放内存，具体可看[这个网站](https://blog.csdn.net/shaosunrise/article/details/85228823?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166546427716781432922292%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=166546427716781432922292&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-85228823-null-null.142^v52^control,201^v3^control_1&utm_term=shared_ptr&spm=1018.2226.3001.4187)

```cpp
shared_ptr<double> double_ptr = make_shared<double>(0.37);
auto double_ptr = make_shared<double>(0.37);				// 和上句等价
```

通常使用 `make_shared` 申请智能指针，可避免申请过程中造成的内存错误

### Antialiasing
