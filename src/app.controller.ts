import { Controller, Get, Res, Post, Body, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
// import Text2SVG from 'text-to-svg'
import * as path from 'path';
import sharp from 'sharp';
import { Readable } from 'stream';
import { Response } from 'express';
import { InfoInterface } from './info.interface';

const Text2SVG = require('text-to-svg');

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {
    }

    /**
     * 粘贴文字
     * @param  { Sharp  } img
     * @param  { String } text 待粘贴文字
     * @param  { Number } fontSize 文字大小
     * @param  { String } color 文字颜色
     * @param  { Number } left 文字距图片左边缘距离
     * @param  { Number } top 文字距图片上边缘距离
     */
    async pasteText(img, {
        text, fontSize, color, left, top,
    }) {
        const text2SVG = Text2SVG.loadSync();
        const attributes = { fill: color };
        const options = {
            fontSize,
            anchor: 'top',
            attributes,
        };
        const svg = Buffer.from(text2SVG.getSVG(text, options));
        return img
            .overlayWith(svg, { left, top });
    }


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
        // console.log(bgPath)
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

    getReadableStream(buffer: Buffer): Readable {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        return stream;
    }

    /**
     * 水印
     * @param mimeType
     * @private
     */
    private generateMimeTypeOverlay(mimeType: string): Buffer {
        return Buffer.from(`
            <svg xmlns="http://www.w3.org/2000/svg" height="150" width="800">
            <style>
                text {
                   font-size: 64px;
                   font-family: Arial, sans-serif;
                   fill: #666;
                }
              </style>

              <text x="400" y="110"  text-anchor="middle" width="800">${mimeType}</text>
            </svg>`);
    }
}
