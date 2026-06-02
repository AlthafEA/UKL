import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client/wasm';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }
  async registerAdmin(createAuthDto: CreateAuthDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: createAuthDto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(createAuthDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createAuthDto.email,
        passwordHash,
        role: Role.ADMIN, // default
      },
      select: { id: true, email: true, role: true },
    });

    // optional: langsung kasih token setelah register
    // const access_token = await this.jwt.signAsync({
    //   sub: user.id,
    //   email: user.email,
    //   role: user.role,
    // });

    return { user,};
  }

  async registerCustomer(createAuthDto: CreateAuthDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: createAuthDto.email } });
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(createAuthDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createAuthDto.email,
        passwordHash,
        role: Role.CUSTOMER, // default
      },
      select: { id: true, email: true, role: true },
    });

    // optional: langsung kasih token setelah register
    // const access_token = await this.jwt.signAsync({
    //   sub: user.id,
    //   email: user.email,
    //   role: user.role,
    // });

    return { user,};
  }

  async login(loginDto: CreateAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new UnauthorizedException('Email or password is wrong');

    const ok = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Email or password is wrong');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role, // penting untuk RolesGuard
    };

    const access_token = await this.jwt.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
