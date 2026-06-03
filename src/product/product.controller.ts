import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from '../helper/roles-guard';
import { Roles } from '../helper/roles-decorator';

type UploadedFile = {
  buffer?: Buffer;
  path?: string;
};

@ApiTags('Products')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // -------- PUBLIC --------
  @Get('products')
  @ApiOperation({
    summary: 'Daftar produk (Publik)',
    description:
      'Mengambil daftar produk aktif dengan pagination dan filter berdasarkan ' +
      'kategori, warna, ukuran, dan rentang harga.',
  })
  @ApiOkResponse({ description: 'Berhasil mengambil daftar produk' })
  async list(@Query() query: QueryProductDto) {
    try {
      return await this.productService.list(query);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Gagal mengambil daftar produk');
    }
  }

  @Get('/products/all')
  @ApiOperation({
    summary: 'Daftar semua produk dan kategori aktif (Publik)',
    description: 'Mengambil semua produk aktif dan kategori aktif tanpa filter.',
  })
  @ApiOkResponse({ description: 'Berhasil mengambil semua produk dan kategori' })
  async listAll() {
    try {
      return await this.productService.listAll();
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Gagal mengambil semua produk');
    }
  }

  @Get('products/:slug')
  @ApiOperation({
    summary: 'Detail produk (Publik)',
    description: 'Mengambil detail produk berdasarkan slug, termasuk SKU dan inventory.',
  })
  @ApiParam({ name: 'slug', description: 'Slug produk', example: 'sepatu-running-hitam' })
  @ApiOkResponse({ description: 'Berhasil mengambil detail produk' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan atau tidak aktif' })
  async detail(@Param('slug') slug: string) {
    try {
      return await this.productService.detailBySlug(slug);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal mengambil detail produk');
    }
  }

  // -------- ADMIN --------
  @Post('products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buat produk atau SKU baru (Admin)',
    description:
      'Membuat produk baru (type=PRODUCT) atau menambah varian/SKU ke produk yang sudah ada (type=SKU). ' +
      'Hanya Admin yang bisa mengakses.',
  })
  @ApiCreatedResponse({ description: 'Produk/SKU berhasil dibuat' })
  @ApiBadRequestResponse({ description: 'Validasi gagal atau slug/SKU duplikat' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async create(@Body() dto: CreateProductDto) {
    try {
      return await this.productService.create(dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal membuat produk');
    }
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update produk (Admin)',
    description: 'Mengupdate data produk. Gunakan type=PRODUCT atau kosongkan type.',
  })
  @ApiParam({ name: 'id', description: 'ID produk (CUID)' })
  @ApiOkResponse({ description: 'Produk berhasil diupdate' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'Validasi gagal atau slug duplikat' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      return await this.productService.updateProduct(id, dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal mengupdate produk');
    }
  }

  @Post('products/:id/image')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload gambar produk (Admin)',
    description: 'Upload gambar produk ke Cloudinary. File dikirim sebagai multipart/form-data.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File gambar produk',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File gambar (JPG/PNG)',
        },
      },
      required: ['file'],
    },
  })
  @ApiParam({ name: 'id', description: 'ID produk (CUID)' })
  @ApiOkResponse({ description: 'Gambar berhasil diupload' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'File tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async uploadImage(@Param('id') id: string, @UploadedFile() file: UploadedFile) {
    try {
      return await this.productService.uploadProductImage(id, file);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal upload gambar');
    }
  }

  @Patch('skus/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update SKU/varian (Admin)',
    description: 'Mengupdate warna dan/atau ukuran SKU. Gunakan type=SKU di body.',
  })
  @ApiParam({ name: 'id', description: 'ID SKU (CUID)' })
  @ApiOkResponse({ description: 'SKU berhasil diupdate' })
  @ApiNotFoundResponse({ description: 'SKU tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'Validasi gagal atau SKU duplikat' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async updateSku(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      return await this.productService.updateSku(id, dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal mengupdate SKU');
    }
  }

  @Patch('inventories/:skuId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update stok inventory (Admin)',
    description: 'Mengupdate jumlah stok untuk SKU tertentu. Gunakan type=STOCK di body.',
  })
  @ApiParam({ name: 'skuId', description: 'ID SKU (CUID)' })
  @ApiOkResponse({ description: 'Stok berhasil diupdate' })
  @ApiNotFoundResponse({ description: 'SKU tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'type harus STOCK dan stock wajib diisi' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async updateStock(@Param('skuId') skuId: string, @Body() dto: UpdateProductDto) {
    try {
      return await this.productService.updateStock(skuId, dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal mengupdate stok');
    }
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hapus produk (Admin)',
    description: 'Menghapus produk beserta semua SKU dan inventory terkait.',
  })
  @ApiParam({ name: 'id', description: 'ID produk (CUID)' })
  @ApiOkResponse({ description: 'Produk berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async remove(@Param('id') id: string) {
    try {
      return await this.productService.remove(id);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Gagal menghapus produk');
    }
  }
}
