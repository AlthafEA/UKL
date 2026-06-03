import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  // main.ts
  app.enableCors({
    origin: 'https://ukl-4-fe.vercel.app, http://localhost:3000', // <-- Ganti dengan URL frontend Anda
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // ← Explicit headers
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('UKL Backend API')
    .setDescription(
      'REST API untuk aplikasi e-commerce UKL. ' +
      'Dibangun dengan NestJS + Prisma + MySQL. ' +
      'Gunakan endpoint `/auth/login` untuk mendapatkan JWT token, ' +
      'lalu klik tombol **Authorize** di atas dan masukkan token.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan JWT token yang didapat dari endpoint login',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Registrasi & Login pengguna')
    .addTag('Categories', 'Manajemen kategori produk')
    .addTag('Products', 'Manajemen produk, SKU, dan inventory')
    .addTag('Orders', 'Checkout, pembayaran, dan manajemen pesanan')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/docs`);

  console.log('CLOUDINARY CONFIG:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***ada***' : 'KOSONG',
  });
}
bootstrap();

