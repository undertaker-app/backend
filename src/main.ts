import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : true,
    credentials: true,
  });

  // 전역 파이프 설정 (유효성 검사)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 전역 필터 설정 (예외 처리)
  app.useGlobalFilters(new HttpExceptionFilter());

  // 전역 인터셉터 설정 (응답 형식 변환)
  app.useGlobalInterceptors(new ResponseInterceptor());

  // API 전역 접두사 설정
  app.setGlobalPrefix('api');

  // Swagger 문서 설정
  const config = new DocumentBuilder()
    .setTitle('지하철 좌석 공유 API')
    .setDescription('언더테이커 지하철 좌석 공유 앱의 백엔드 API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력하세요',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 애플리케이션이 http://localhost:${port} 에서 실행중입니다`);
  console.log(`📚 API 문서: http://localhost:${port}/api/docs`);
}

bootstrap();
