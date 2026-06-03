import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
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
    description:
      'Mengambil daftar kategori dengan pagination dan filter. Endpoint publik.',
  })
  @ApiOkResponse({ description: 'Berhasil mengambil daftar kategori' })
  async findAll(@Query() query: QueryCategoryDto) {
    try {
      return await this.categoryService.findAll(query);
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Gagal mengambil daftar kategori',
      );
    }
  }

  @Get('all')
  @ApiOperation({
    summary: 'Daftar semua kategori aktif (Publik)',
    description: 'Mengambil semua kategori aktif tanpa filter.',
  })
  @ApiOkResponse({ description: 'Berhasil mengambil semua kategori' })
  async listAll() {
    try {
      return await this.categoryService.listAll();
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Gagal mengambil semua kategori',
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail kategori',
    description: 'Mengambil detail satu kategori berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID kategori (CUID)',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @ApiOkResponse({ description: 'Berhasil mengambil detail kategori' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.categoryService.findOne(id);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal mengambil detail kategori',
      );
    }
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
  async create(@Body() dto: CreateCategoryDto) {
    try {
      return await this.categoryService.create(dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal membuat kategori',
      );
    }
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
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    try {
      return await this.categoryService.update(id, dto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal mengupdate kategori',
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Hapus kategori (Admin)',
    description:
      'Menghapus kategori berdasarkan ID. Hanya bisa diakses oleh Admin.',
  })
  @ApiParam({ name: 'id', description: 'ID kategori (CUID)' })
  @ApiOkResponse({ description: 'Kategori berhasil dihapus' })
  @ApiNotFoundResponse({ description: 'Kategori tidak ditemukan' })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async remove(@Param('id') id: string) {
    try {
      return await this.categoryService.remove(id);
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Gagal menghapus kategori',
      );
    }
  }
}
