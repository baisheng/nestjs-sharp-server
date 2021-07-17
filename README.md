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
