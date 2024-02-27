import express, { Request, Response } from 'express';
import fs from 'fs';
import { photosDirectory } from '../../settings';

class Interval {
  logger: any;
  constructor (logger: any) {
    this.logger = logger;
  }
  private deleteOldFiles(): void {
    const files = fs.readdirSync(photosDirectory);
    const currentTime = Date.now();

    files.forEach((file) => {
      const filePath = `${photosDirectory}/${file}`;
      const fileStat = fs.statSync(filePath);
      const fileModifiedTime = fileStat.mtime.getTime();
      const elapsedTime = currentTime - fileModifiedTime;
      const tenMinutes = 10 * 60 * 1000;

      if (elapsedTime > tenMinutes) {
        fs.unlinkSync(filePath);
        this.logger.info(`deleted file: ${file}`);
      }
    });
  }
  public async interval () {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
      this.deleteOldFiles();
    }
  }
}
export default class Server {
  private app: express.Application;
  private port: number;
  private logger: any
  private config: any;

  constructor (logger: any, config: any) {
    this.app = express();
    this.config = config;
    this.logger = logger;
    this.port = this.config.get('PORT') || 1111;
    this.app.use(express.json());
    this.app.use('/photos', express.static(photosDirectory));
  }

  public init(): void {
    new Interval(this.logger).interval()

    if (!fs.existsSync(photosDirectory)) {
      fs.mkdirSync(photosDirectory);
    }
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Kolersky API for uploading photos');
    });
    this.app.listen(this.port, () => {
      this.logger.info(`the server is running on the port ${this.port}`);
    });  
  }
}