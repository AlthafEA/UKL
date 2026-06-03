import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type UploadedFile = {
  buffer?: Buffer;
  path?: string;
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  // ---------- PUBLIC ----------
  async list(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // where for product
    const where: any = { isActive: true };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { slug: { contains: query.q } },
        { description: { contains: query.q } },
      ];
    }

    if (
      typeof query.minPrice === 'number' ||
      typeof query.maxPrice === 'number'
    ) {
      where.basePrice = {};
      if (typeof query.minPrice === 'number')
        where.basePrice.gte = query.minPrice;
      if (typeof query.maxPrice === 'number')
        where.basePrice.lte = query.maxPrice;
    }

    // categorySlug filter (join via category)
    if (query.categorySlug) {
      where.category = { slug: query.categorySlug, isActive: true };
    }

    // SKU filter: color/size should filter products that have matching SKU.
    // Optionally also ensure inventory.stock > 0 for that sku.
    if (query.color || query.size) {
      where.skus = {
        some: {
          ...(query.color ? { color: query.color } : {}),
          ...(query.size ? { size: query.size } : {}),
          inventory: { is: { stock: { gt: 0 } } },
        },
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { page, limit, total, items };
  }

  async listAll() {
    const [products, categories] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return { products, categories };
  }

  async detailBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        skus: {
          include: {
            inventory: true,
          },
          orderBy: [{ color: 'asc' }, { size: 'asc' }],
        },
      },
    });

    if (!product || !product.isActive)
      throw new NotFoundException('Product not found');
    return product;
  }

  // ---------- ADMIN ----------
  async create(dto: CreateProductDto) {
    if (dto.type === 'SKU') return this.createSku(dto);
    if (dto.type !== 'PRODUCT') throw new BadRequestException('Invalid type');

    try {
      return await this.prisma.product.create({
        data: {
          categoryId: dto.categoryId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          basePrice: dto.basePrice,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: any) {
      throw new BadRequestException(
        'Failed to create product. Slug might already exist.',
      );
    }
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    // treat missing type as PRODUCT update
    if (!dto.type || dto.type === 'PRODUCT') {
      await this.ensureProduct(productId);

      try {
        return await this.prisma.product.update({
          where: { id: productId },
          data: {
            categoryId: dto.categoryId,
            name: dto.name,
            slug: dto.slug,
            description: dto.description,
            basePrice: dto.basePrice,
            imageUrl: dto.imageUrl,
            isActive: (dto as any).isActive, // if you add it later
          },
        });
      } catch (e: any) {
        throw new BadRequestException(
          'Failed to update product. Slug might already exist.',
        );
      }
    }

    if (dto.type === 'IMAGE') {
      await this.ensureProduct(productId);
      return this.prisma.product.update({
        where: { id: productId },
        data: { imageUrl: dto.imageUrl },
      });
    }

    throw new BadRequestException('Invalid type for product update');
  }

  async uploadProductImage(productId: string, file: UploadedFile) {
    console.log('FILE RECEIVED:', file); // <-- tambah ini
    await this.ensureProduct(productId);
    if (!file) throw new BadRequestException('File is required');

    // Pastikan file punya buffer
    if (!file.buffer) throw new BadRequestException('File buffer is missing');

    const uploaded = await this.cloudinary.uploadImage(file as any, {
      folder: `products/${productId}`,
    });

    return this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: uploaded.secure_url ?? uploaded.url },
    });
  }

  async createSku(dto: CreateProductDto) {
    // dto.type === 'SKU'
    await this.ensureProduct(dto.productId);

    try {
      const sku = await this.prisma.productSku.create({
        data: {
          productId: dto.productId,
          color: dto.color,
          size: dto.size,
        },
      });

      // upsert inventory if initialStock provided
      if (typeof dto.initialStock === 'number') {
        await this.prisma.inventory.upsert({
          where: { skuId: sku.id },
          update: { stock: dto.initialStock },
          create: { skuId: sku.id, stock: dto.initialStock },
        });
      } else {
        // ensure inventory exists with 0 (optional)
        await this.prisma.inventory.upsert({
          where: { skuId: sku.id },
          update: {},
          create: { skuId: sku.id, stock: 0 },
        });
      }

      return this.prisma.productSku.findUnique({
        where: { id: sku.id },
        include: { inventory: true },
      });
    } catch (e: any) {
      throw new BadRequestException(
        'Failed to create SKU. Possibly duplicate (product,color,size).',
      );
    }
  }

  async updateSku(skuId: string, dto: UpdateProductDto) {
    if (dto.type !== 'SKU') throw new BadRequestException('type must be SKU');

    await this.ensureSku(skuId);

    try {
      return await this.prisma.productSku.update({
        where: { id: skuId },
        data: {
          color: dto.color,
          size: dto.size,
        },
      });
    } catch (e: any) {
      throw new BadRequestException(
        'Failed to update SKU. Possibly duplicate (product,color,size).',
      );
    }
  }

  async updateStock(skuId: string, dto: UpdateProductDto) {
    if (dto.type !== 'STOCK')
      throw new BadRequestException('type must be STOCK');
    if (typeof dto.stock !== 'number')
      throw new BadRequestException('stock is required');

    await this.ensureSku(skuId);

    return this.prisma.inventory.upsert({
      where: { skuId },
      update: { stock: dto.stock },
      create: { skuId, stock: dto.stock },
    });
  }

  // ---------- helpers ----------
  private async ensureProduct(productId: string) {
    const p = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  private async ensureSku(skuId: string) {
    const s = await this.prisma.productSku.findUnique({ where: { id: skuId } });
    if (!s) throw new NotFoundException('SKU not found');
    return s;
  }

  async remove(id: string) {
    try {
      const findProduct = await this.prisma.product.findUnique({
        where: { id },
      });
      if (!findProduct) {
        return {
          success: false,
          message: 'Product does not exist',
          data: null,
        };
      }

      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete product',
        data: null,
      };
    }
  }
}
