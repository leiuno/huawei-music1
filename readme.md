项目特点
1、移动端项目，移动端项目开发注意的特点
2、flex布局
3、svg
4、打包工具，parcel
5、sass
模块化的编码，会用到一些打包工具，webpack\parcel

npm初始化,生成package.json文件
```
npm init -y
```

安装parcel
```
npm i --save-dev parcel-bundler
```

如果npm安装太慢，可以切换源
nrm工具切换源
```
npm install -g nrm
nrm use cnpm
nrm use npm
```
也可以直接用命令切换
```
切换到cnpm的源
npm config set registry http://r.cnpmjs.org/
切换回来
npm config set registry https://registry.npmjs.org/
```
开发环境
npx parcel index.html

发布上线
npx parcel build index.html
报错的话

安装sass
npm i --save-dev sass

开启服务
npx parcel index.html


创建html
源文件放在src路径下
编译后的文件放在dist目录下

sass，不使用大括号和分号
