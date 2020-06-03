const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const baseDir = path.resolve(__dirname, './src/pages');
// 同步版本的 fs.readdir() 。 fs.readdirSync
const entries = fs.readdirSync(baseDir).reduce(function (entries, dir) {
  const fullPath = path.resolve(baseDir, dir);
  const entry = path.join(fullPath, 'index.js');
  if (fs.statSync(fullPath).isDirectory() && fs.existsSync(entry)) {
    entries[dir] = entry;
  }
  return entries;
}, {});

const htmlPlugin = Object.keys(entries).map((key) => {
  const title = key === 'index' ? '首页' : '登录';
  return new HtmlWebpackPlugin({
    title,
    template: './src/index.html',
    inject: true,
    chunks: [`${key}`],
    filename: `${key}.html`,
  });
});

module.exports = {
  //   entry: "./src/index.js",
  entry: entries,
  output: {
    path: path.resolve(__dirname, './dist'),
    //js模块，咱们就是chunkhash(可以用来做版本管理 比如我们的index里面发生变化 我们的这个hash就会发生变化，这样发到线上之后
    // 我们 login 还能用浏览器的缓存，保证一些性能
    // )  占位符 保证名字唯一  contenthash内容hash  chunk可以理解成 代码块  模块
    // 1. hash 每次都会变  2. chunkhash 根据入口文件，一个入口文件对应一个chunk  3. contenthash
    filename: '[name]_[chunkhash:8].js',
    // filename: "[name].js"
  },
  // 设置mode可以⾃动触发webpack内置的函数，达到优化的效果 没有设置  会自动设置成 production
  // 用来指定当前环境  会默认开启不同的插件
  // 开发阶段的开启会有利于热更新的处理，识别哪个模块变化   ⽣产阶段的开启会有帮助模块压缩，处理副作⽤等⼀些功能
  // 开发: 热更新的时候  process.env.NODE_ENV 生产:压缩 tree shaking 代码分割
  mode: 'development',
  // loader 模块解析，模块转换器，⽤于把模块原内容按照需求转换成新内容
  // webpack是模块打包⼯具，⽽模块不仅仅是js，还可以是css，图⽚或者其他格式
  // 但是webpack默认只知道如何处理js和JSON模块，那么其他格式的模块处理，和处理⽅式就需要loader了

  // 当webpack处理到不认识的模块时，需要在webpack中的module处进⾏配置，当检测到是什么格式的模块，使⽤什么loader来处理。
  //  file-loader 原理是把打包⼊⼝中识别出的资源模块，移动到输出⽬录，并且返回⼀个地址名称
  // 场景：就是当我们需要模块，仅仅是从源代码挪移到打包⽬录，就可以使⽤file-loader来处理，txt，svg，csv，excel，图⽚资源啦等等
  module: {
    rules: [
      // loader模块处理
      {
        test: /\.(png|jpe?g|gif)$/, // 指定匹配规则
        // use: "url-loader",
        use: {
          loader: 'url-loader', //内部使用了file-loader 强化本
          // options额外的配置，⽐如资源名称
          options: {
            name: '[name].png',
            outputPath: 'images/',
            limit: 2048, // 图片11kb 如果小于这个设置 转化成base64  没有生成新的images页面显示base64了
          },
        },
      },
      // {
      //   test: /\.(png|jpe?g|gif)$/,
      //   //use使⽤⼀个loader可以⽤对象，字符串，两个loader需要⽤数组
      //   use: {
      //     loader: 'file-loader',
      //     // options额外的配置，⽐如资源名称
      //     options: {
      //       // placeholder 占位符 [name]⽼资源模块的名称
      //       // [ext]⽼资源模块的后缀
      //       // https://webpack.js.org/loaders/fileloader#placeholders
      //       name: '[name]_[hash:8].[ext]',
      //       //打包后的存放位置
      //       outputPath: 'images/',
      //       publicPath: '../images',
      //     },
      //   },
      // },
      {
        test: /\.(woff2|woff)$/,
        use: {
          loader: 'file-loader',
        },
      },
      // Css-loader 分析css模块之间的关系，并合成⼀个css
      // Style-loader 会把css-loader⽣成的内容，以style挂载到⻚⾯的heade部分 <style></style>
      // loader有顺序，从右到左，从下到上
      // 样式⾃动添加前缀 postcss-loader
      // postcss.config.js  一个postcss拓展的文件 减少我们在webpack.config.js的书写
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
          'postcss-loader',
          // {
          //   loader: 'postcss-loader',
          //   options: {
          //     plugins: () => [
          //       require('autoprefixer')({
          //         overrideBrowserslist: ['last 2 versions', '>1%'], //autoprefixer新版本中browsers替换成overrideBrowserslist
          //       }),
          //     ],
          //   },
          // },
        ],
      },
    ],
  },
  // 插件配置
  //plugin 可以在webpack运⾏到某个阶段的时候，帮你做⼀些事情，类似于
  // ⽣命周期的概念
  // 扩展插件，在 Webpack 构建流程中的特定时机注⼊扩展逻辑来改变构建结
  // 果或做你想要的事情。
  // 作⽤于整个构建过程
  plugins: [
    ...htmlPlugin,
    // new HtmlWebpackPlugin({
    //   title: '首页', // ⽤来⽣成⻚⾯的 title 元素 页面只支持ejs模板语法
    //   template: './src/index.html', // 模板⽂件路径
    //   // 注⼊所有的资源到特定
    //   // 的 template 或者 templateContent 中，如果设置为 true 或者
    //   // body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将
    //   // 放置到 head 元素中
    //   inject: true,
    //   //  允许只添加某些块 (⽐如，仅仅 unit test 块)
    //   // 我们这个html想引入哪个打包后的chunk
    //   chunks: ['index'],
    //   //  输出的 HTML ⽂件名，默认是 index.html, 也可以直接配置带有⼦⽬录。
    //   filename: 'index.html',
    // }),
    // new HtmlWebpackPlugin({
    //   title: '登录',
    //   template: './src/index.html',
    //   inject: true,
    //   chunks: ['login'],
    //   filename: 'login.html',
    // }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name]_[contenthash:8].css',
    }),
  ],
  // 文件监听
  // 轮询判断⽂件的最后编辑时间是否变化，某个⽂件发⽣了变化，并不会⽴刻告诉监听者，先缓存起来

  // watch监听  两种模式 package配置 这里配置 这里设置了我们最好配置一下 watchOptions
  watch: true, //false
  // watchOptions: {
  //   //默认为空，不监听的文件或者目录，支持正则
  //   ignored: /node_modules/,
  //   //监听到文件变化后，等300ms再去执行，默认300ms,
  //   aggregateTimeout: 300,
  //   //判断文件是否发生变化是通过不停的询问系统指定文件有没有变化，默认每秒问1次
  //   poll: 1000//ms
  // }
};
