import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

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

  const outputPath = join(__dirname, '..', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');

  console.log(`OpenAPI spec written to ${outputPath}`);

  await app.close();
}

generate().catch((err) => {
  console.error('Failed to generate OpenAPI spec:', err);
  process.exit(1);
});
