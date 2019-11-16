# markCV
> Markdown 生成漂亮的简历网页

[示例](https://bigliao.github.io/markCV/)

## 1. 特点

### 使用 Markdown 写简历

厌倦了写简历的时候找各种模板，那些模板编辑起来也很不方便，一不小心格式就乱了。
最重要的是，**内容与表现不分离**，用程序员的话讲就是过于**耦合**，当你想换一个模板的时候又得重新编辑一遍。

Markdown 作为一种通用文本格式就可以很好地解决这个问题。你只要专注于写内容，展示的事情交给其他渲染工具。本工具就是一个帮你生成漂亮的简历网页的工具。

### 在线简历

简历应当方便传播，在线简历就可以很好做到这一点。别人问你要简历的时候，直接一串网址丢过去，无论微信、QQ 或者什么地方都可以直接打开，根本不用担心格式问题。本工具已经调整好了打印样式，直接打印网页就可以，可以说是非常方便。

## 2. 使用方法

### 方法一：直接使用Docker镜像

pull镜像，准备一个文件夹，然后将简历文件、配置文件、输出目录挂载到容器内部：

```shell script
docker pull saodd/mark-cv

docker run --rm -v 你的简历文件路径:/markCV/markdown/resume-template.md \ 
    -v 你的配置文件路径:/markCV/_config.yml \
    -v 你的输出路径:/markCV/dist \
    -p 3000:3000 -it saodd/mark-cv bash

npm run dev # 开发、编写简历
npm run build # 打包
npm run deploy # 发布到 GitHub Pages
```

### 方法二：自定义Docker容器

使用`node`镜像运行本项目即可，目前`node:12.10.0`试用正常。

```shell script
docker run --rm -v 你的项目路径:/markCV -w /markCV -p 3000:3000 -it node:12.10.0 bash
```

### 方法三：安装node环境
本工具基于 [Node.js](https://nodejs.org) 开发，需要有 `Node.js` 开发环境。

#### 使用 npm 安装
```bash
# 先建一个文件夹存放简历
mkdir my-resume && cd mkdir my-resume

# 初始化 npm
npm init -y

# 安装 markCV
npm install -S mark-cv

```
#### 初始化
直接使用 `npx markcv init`，自动创建简历模板。

或者手动创建：
```bash
# 新建简历文件
touch liming.md

# 写点内容
echo '# 李明的个人信息' > liming.md

# 配置 markCV 
touch _config.yml
# 把下面的配置内容抄进来
```

#### 编辑和预览简历
```bash
npx markcv write
```
打开浏览器访问 http://localhost:3000 可以看到效果。可以一边修改 markdown 一边看效果

#### 打包
```bash
npx markcv build
```
生成静态网页放在 dist 目录下。最后把生成的 dist 文件夹部署到服务器就可以了。

没有服务器的话可以部署到 GitHub Pages 上面。本工具提供了快捷命令
```bash
npx markcv publish
```

### 通过 clone 本仓库使用

你也可以选择直接 clone 本仓库代码到你的电脑上。然后自己可以调整样式。
```bash
git clone https://github.com/BigLiao/markCV.git

cd markCV

npm install

npm run dev # 开发、编写简历
npm run build # 打包
npm run deploy # 发布到 GitHub Pages

```

## 3. 配置
需要在根目录里放一个 `_config.yml` 配置文件，内容如下
```yml
# 网页的 Title，在浏览器标签页里可以看到
title: 'markCV - Beautiful online resume' 

# 如果部署的时候部署放在根目录而是子目录的，就要配置 publicPath
# 比如在 GitHub Pages 里，需要配置为项目名称，如下。
# 可以不配置，默认是 / 
publicPath: '/markCV/'

# 简历 markdown 地址，相对本配置文件的。必须
resumePath: './markdown/resume-template.md'
```
