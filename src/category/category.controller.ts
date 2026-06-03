import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { RolesGuard } from '../helper/roles-guard';
import { Roles } from '../helper/roles-decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar semua kategori',
    description: 'Mengambil daftar kategori dengan pagination dan filter. Endpoint publik.',
  })
  @ApiOkResponse({
    description: 'Berhasil mengambil daftar kategori',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        total: { type: 'number', example: 5 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: '' },
              slug: { type: 'string', example: '' },
              isActive: { type: 'boolean', example: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  findAll(@Query() query: QueryCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail kategori',
    description: 'Mengambil detail satu kategori berdasarkan ID.',
  })
  @ApiParam({ name: 'id', description: 'ID kategori (CUID)', example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @ApiOkResponse({ description: 'Berhasil mengambil detail kategori' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buat kategori baru (Admin)',
    description: 'Membuat kategori baru. Hanya bisa diakses oleh Admin.',
  })
  @ApiCreatedResponse({ description: 'Kategori berhasil dibuat' })
  @ApiBadRequestResponse({ description: 'Slug sudah ada atau validasi gagal' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update kategori (Admin)',
    description: 'Mengupdate data kategori. Hanya bisa diakses oleh Admin.',
  })
  @ApiParam({ name: 'id', description: 'ID kategori (CUID)' })
  @ApiOkResponse({ description: 'Kategori berhasil diupdate' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiBadRequestResponse({ description: 'Slug sudah ada atau validasi gagal' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hapus kategori (Admin)',
    description: 'Menghapus kategori berdasarkan ID. Hanya bisa diakses oleh Admin.',
  })
  @ApiParam({ name: 'id', description: 'ID kategori (CUID)' })
  @ApiOkResponse({ description: 'Kategori berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}