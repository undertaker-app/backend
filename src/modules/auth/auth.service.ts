import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { RegisterPayload } from './dto/register.payload';
import { LoginPayload } from './dto/login.payload';
import { VerifyEmailPayload } from './dto/verify-email.payload';
import {
  UserResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerData: RegisterPayload): Promise<UserResponseDto> {
    const { email, password, nickname, phoneNumber } = registerData;

    // 이메일 중복 확인
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    // 닉네임 중복 확인
    const existingNickname = await this.prisma.user.findFirst({
      where: { nickname },
    });

    if (existingNickname) {
      throw new ConflictException('이미 사용중인 닉네임입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        phoneNumber,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        phoneNumber: true,
        coinBalance: true,
        penaltyCount: true,
        isBanned: true,
        profileImageUrl: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new UserResponseDto(user);
  }

  async login(loginData: LoginPayload): Promise<LoginResponseDto> {
    const { email, password } = loginData;

    // 사용자 찾기
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 계정 정지 확인
    if (user.isBanned) {
      throw new UnauthorizedException('정지된 계정입니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 마지막 로그인 시간 업데이트
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 토큰 생성
    const tokens = await this.generateTokens(user.id, user.email);

    // 사용자 정보 (비밀번호 제외)
    const userResponse = new UserResponseDto({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      phoneNumber: user.phoneNumber,
      coinBalance: user.coinBalance,
      penaltyCount: user.penaltyCount,
      isBanned: user.isBanned,
      profileImageUrl: user.profileImageUrl,
      lastLoginAt: new Date(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    return {
      ...tokens,
      user: userResponse,
      expiresIn: 15 * 60, // 15분
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    // 리프레시 토큰 검증
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.isRevoked ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    // 새 액세스 토큰 생성
    const payload: JwtPayload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: 15 * 60, // 15분
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // 리프레시 토큰 무효화
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { isRevoked: true },
    });
  }

  async sendVerificationCode(email: string): Promise<void> {
    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 기존 인증 코드 삭제
    await this.prisma.emailVerification.deleteMany({
      where: { email, isUsed: false },
    });

    // 새 인증 코드 저장
    await this.prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // TODO: 실제 이메일 발송 로직 구현
    console.log(`이메일 인증 코드: ${code} (${email})`);
  }

  async verifyEmail(verifyData: VerifyEmailPayload): Promise<void> {
    const { email, code } = verifyData;

    // 인증 코드 확인
    const verification = await this.prisma.emailVerification.findFirst({
      where: {
        email,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      throw new BadRequestException('유효하지 않거나 만료된 인증 코드입니다.');
    }

    // 인증 코드 사용 처리
    await this.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async checkNicknameExists(nickname: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { nickname },
      select: { id: true },
    });
    return !!user;
  }

  private async generateTokens(userId: number, email: string) {
    const payload: JwtPayload = { sub: userId, email };

    // 액세스 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    // 리프레시 토큰 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refresh-secret',
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // 리프레시 토큰 저장
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
