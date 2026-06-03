import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug: dto.slug,
        },
      });
    } catch (e: any) {
      // slug unique violation (Prisma code differs by connector; keep generic)
      throw new BadRequestException(
        'Failed to create category. Slug might already exist.',
      );
    }
  }

  async findAll(query: QueryCategoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (typeof query.isActive === 'boolean') where.isActive = query.isActive;
    if (query.slug) where.slug = query.slug;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { slug: { contains: query.q } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      items,
    };
  }

  async listAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name,
          slug: dto.slug,
          isActive: dto.isActive,
        },
      });
    } catch (e: any) {
      throw new BadRequestException(
        'Failed to update category. Slug might already exist.',
      );
    }
  }

  async remove(id: string) {
    try {
      const findCategory = await this.prisma.category.findUnique({
        where: { id },
      });
      if (!findCategory) {
        return {
          success: false,
          message: 'Category does not exist',
          data: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete category',
        data: null,
      };
    }
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
