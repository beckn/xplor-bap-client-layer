import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AppController],
      providers: [AppService], // Include GetUrl here
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return server status as "ok"', () => {
      expect(appController.getHealth().status).toBe('ok');
    });
  });
});
