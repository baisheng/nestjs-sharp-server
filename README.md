## Description
基于 Nestjs + Sharp 的证书图片生成服务
**本项目是一个 demo 版本，主要作为 nestjs + sharp 的应用示例**

## 安装

```bash
$ npm install
```
或
```bash
$ yarn install
```

## 开发或部署

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Docker 部署
### docker 直接运行
```
$ docker run -d -t sharp-server
```
### docker 编排文件运行
**请修改 [docker-compose.yml](./docker-compose.yml)**
```
$ docker-compose up -d
```


## 请求示例
```
GET http://localhost:3000/?name=名字&date=2021-01-01至2022-01-02
```
## Stay in touch

- Author - [Baisheng](https://baisheng.me)

## License

  Nest is [MIT licensed](LICENSE).


![nestjs+sharp](https://upload-images.jianshu.io/upload_images/1511070-244a8df4d21bbdfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 背景
> 项目源码地址在文未

在一个会员认证系统中收到了一个证书生成需求：
- 在设计模板中填充中文会员名、会员到期信息（未来需要增加二维码）
- 可以根据不同的提交参数生成并下载高清会员证书
- 可按指定字体绘制到图片

> 这个需求中主要体现两个要求：在特定的模板中填充中文信息、根据提交的参数返回证书图、需要字体文件处理。需求比较清晰简单，但是实现上面我们还是要设计一下。

## 证书示例
![template-image.png](https://upload-images.jianshu.io/upload_images/1511070-86057a6a61aab53b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/600)

## 选型
**应用框架**
近期项目大部分都是基于 nodejs 平台的，并且 nestjs 这个框架我们运用的不错，简洁高效，所以 api 服务就选用了 `Nestjs`。

**图像处理**
因为需求中涉及了图像处理，而在 nodejs 社区中最知名的是 `Sharp` 这个库。
> 这个模块可将常见格式的大图像转换为较小的、web友好的JPEG、PNG、WebP和不同尺寸的AVIF图像。模块的实现基于 libvips，调整图像大小通常比使用最快的ImageMagick和GraphicsMagick设置快4x-5x倍。并且大多数运行Node.js v10+的现代macOS、Windows和Linux系统不需要任何额外的安装或运行时依赖项。

**文字处理**
由于我们需要将文字写入到图片中，比如会员证书中设计是用的这个字体 NotoSerifCJKsc-Bloack.oft，那么就需要根据请求数据填充的内容也是要应用这个字体。这里我们选用了 `text-to-svg` 这个模块，它的最大特点是可以将字体文件转换为 svg 格式，处理成适量格式后图像中的文字不会失真和乱码。


## 程序开发

### 环境和工程目录建立
```
$ npm i -g @nestjs/cli
$ nest new nestjs-sharp-server
```
### 安装主要依赖
```
yarn add sharp text-to-svg
yarn add types/sharp -D
```
### 项目整体结构
```
.
├── Dockerfile
├── README.md
├── docker-compose.yml
├── fonts     #字体文件
│   ├── NotoSerifCJKsc-Black.otf
│   └── NotoSerifCJKsc-SemiBold.otf
├── image.png
├── nest-cli.json
├── package.json
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts    # API实现
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── info.interface.ts
│   └── main.ts
├── template-image.png    #会员证书模板
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
├── tsconfig.json
├── tslint.json
├── yarn-error.log
└── yarn.lock

```

### 重点代码
**图像生成函数**
```
    async generateImage(info: InfoInterface): Promise<Buffer> {
        let bgPath = path.join(process.cwd(), '/template-image.png');
        let textToSVG = Text2SVG.loadSync(path.resolve(process.cwd() + '/fonts/', 'NotoSerifCJKsc-SemiBold.otf')); // 加载字体文件

        let options = {
            x: 0,         //文本开头的水平位置（默认值：0）
            y: 0,         // 文本的基线的垂直位置（默认值：0）
            fontSize: 32, // 字体大小
            anchor: 'top', // 坐标中的对象锚点
            // letterSpacing: "",  // 设置字母的间距
            attributes: {
                fill: '#000', // 文字颜色
            },
        };
        const nameSVG = textToSVG.getSVG(info.name + '：', options);
        const dateSVG = textToSVG.getSVG(info.date, options);
        const bufferNameTextSVG = Buffer.from(nameSVG);
        const bufferDateTextSVG = Buffer.from(dateSVG);
        // const qrcode
        return sharp(bgPath)
            .composite([ {
                // input: this.generateMimeTypeOverlay('image'),
                input: bufferNameTextSVG,
                left: 267,
                top: 725,
                // gravity: sharp.gravity.center,
            }, {
                input: bufferDateTextSVG,
                left: 407,
                top: 969,
            } ]).toBuffer();
    }
```
**GET API**
```
    @Get()
    getCertificate(@Query() query: any, @Res() res: Response) {
        this.generateImage({
            ...query,

        }).then((buffer) => {

            const stream = this.getReadableStream(buffer);

            res.set({
                'Cache-Control': 'no-cache',
                'Content-Type': 'image/png',
                'Content-Length': buffer.length,
                'Content-Disposition': 'attachment; filename=certificate.png',
            });

            stream.pipe(res);
        });

    }
```

### 请求示例
```
GET http://localhost:3000/?name=名字&date=2021-01-01至2022-01-02

➜  nestjs-sharp-server git:(main) ✗ yarn start
yarn run v1.22.10
warning ../package.json: No license field
$ nest start
[Nest] 85553   - 07/17/2021, 2:25:36 PM   [NestFactory] Starting Nest application...
[Nest] 85553   - 07/17/2021, 2:25:36 PM   [InstanceLoader] AppModule dependencies initialized +14ms
[Nest] 85553   - 07/17/2021, 2:25:36 PM   [RoutesResolver] AppController {}: +6ms
[Nest] 85553   - 07/17/2021, 2:25:36 PM   [RouterExplorer] Mapped {, GET} route +2ms
[Nest] 85553   - 07/17/2021, 2:25:36 PM   [NestApplication] Nest application successfully started +2ms

```
**Post man测试**
![image.png](https://upload-images.jianshu.io/upload_images/1511070-38fc8e776cd9aef4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 总结
本篇文章介绍了如何使用 nestjs + sharp 模块，按特定模板生成图片的示例。其中特点是讲解了 Nestjs框架与sharp 与实际应用结合，并给出了一定的解决方案。

**项目源码如下，供参考**
[https://github.com/baisheng/nestjs-sharp-server](https://github.com/baisheng/nestjs-sharp-server)
