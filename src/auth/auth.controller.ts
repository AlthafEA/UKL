import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Registrasi pengguna baru',
    description: 'Membuat akun baru dengan email dan password. Email harus unik.',
  })
  @ApiCreatedResponse({
    description: 'Registrasi berhasil',
    schema: {
      type: 'object',
      properties: {
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
  @ApiBadRequestResponse({ description: 'Email sudah terdaftar atau validasi gagal' })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login pengguna',
    description: 'Autentikasi dengan email dan password. Mengembalikan JWT access token.',
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
  login(@Body() loginDto: CreateAuthDto) {
    return this.authService.login(loginDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua data auth (placeholder)' })
  @ApiOkResponse({ description: 'Berhasil mengambil data' })
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil data auth berdasarkan ID (placeholder)' })
  @ApiParam({ name: 'id', description: 'ID auth', example: '1' })
  @ApiOkResponse({ description: 'Berhasil mengambil data' })
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data auth (placeholder)' })
  @ApiParam({ name: 'id', description: 'ID auth', example: '1' })
  @ApiOkResponse({ description: 'Berhasil update data' })
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus data auth (placeholder)' })
  @ApiParam({ name: 'id', description: 'ID auth', example: '1' })
  @ApiOkResponse({ description: 'Berhasil menghapus data' })
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
