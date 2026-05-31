import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // -------- PUBLIC --------
  @Get('products')
  list(@Query() query: QueryProductDto) {
    return this.productService.list(query);
  }

  @Get('products/:slug')
  detail(@Param('slug') slug: string) {
    return this.productService.detailBySlug(slug);
  }

  // -------- ADMIN --------
  @Post('products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto) {
    // dto.type = PRODUCT or SKU
    return this.productService.create(dto);
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Post('products/:id/image')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@Param('id') id: string, @UploadedFile() file: UploadedFile) {
    return this.productService.uploadProductImage(id, file);
  }

  @Patch('skus/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateSku(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    // dto.type = SKU
    return this.productService.updateSku(id, dto);
  }

  @Patch('inventories/:skuId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  updateStock(@Param('skuId') skuId: string, @Body() dto: UpdateProductDto) {
    // dto.type = STOCK
    return this.productService.updateStock(skuId, dto);
  }
}