import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RolesGuard } from '../helper/roles-guard';
import { Roles } from '../helper/roles-decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Daftar semua pengguna (Admin)',
    description:
      'Mengambil daftar seluruh pengguna. Hanya bisa diakses oleh Admin.',
  })
  @ApiOkResponse({
    description: 'Berhasil mengambil daftar pengguna',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', nullable: true },
          email: { type: 'string' },
          role: { type: 'string', example: 'CUSTOMER' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token tidak valid atau tidak ada' })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async findAllUsers() {
    try {
      return await this.authService.findAllUsers();
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Gagal mengambil data pengguna',
      );
    }
  }

  @Post('register/admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrasi admin baru (Admin)',
    description:
      'Membuat akun admin baru dengan email dan password. Hanya bisa diakses oleh Admin.',
  })
  @ApiCreatedResponse({ description: 'Registrasi berhasil' })
  @ApiBadRequestResponse({
    description: 'Email sudah terdaftar atau validasi gagal',
  })
  @ApiForbiddenResponse({ description: 'Hanya Admin yang bisa mengakses' })
  async createAdmin(@Body() createAuthDto: CreateAuthDto) {
    try {
      return await this.authService.registerAdmin(createAuthDto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal registrasi admin',
      );
    }
  }

  @Post('register/customer')
  @ApiOperation({
    summary: 'Registrasi pelanggan baru',
    description:
      'Membuat akun pelanggan baru dengan email dan password. Email harus unik.',
  })
  @ApiCreatedResponse({ description: 'Registrasi berhasil' })
  @ApiBadRequestResponse({
    description: 'Email sudah terdaftar atau validasi gagal',
  })
  async createCustomer(@Body() createAuthDto: CreateAuthDto) {
    try {
      return await this.authService.registerCustomer(createAuthDto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Gagal registrasi pelanggan',
      );
    }
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login pengguna',
    description:
      'Autentikasi dengan email dan password. Mengembalikan JWT access token.',
  })
  @ApiOkResponse({
    description: 'Login berhasil',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxxxxxxxxxxxxxxxxxxxxxxxxx' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', example: 'ADMIN' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Email atau password salah' })
  async login(@Body() loginDto: CreateAuthDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error: any) {
      if (error.status && error.status < 500) throw error;
      throw new InternalServerErrorException(error?.message || 'Gagal login');
    }
  }
}
