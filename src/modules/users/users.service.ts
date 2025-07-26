import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { UpdateUserPayload } from './dto/update-user.payload';
import { ChangePasswordPayload } from './dto/change-password.payload';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateUser(
    userId: number,
    updateData: UpdateUserPayload,
  ): Promise<UserResponseDto> {
    const { nickname, phoneNumber, profileImageUrl } = updateData;

    // 닉네임 변경 시 중복 확인
    if (nickname) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          nickname,
          NOT: { id: userId }, // 본인 제외
        },
      });

      if (existingUser) {
        throw new ConflictException('이미 사용중인 닉네임입니다.');
      }
    }

    // 사용자 정보 업데이트
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname && { nickname }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(profileImageUrl !== undefined && { profileImageUrl }),
        updatedAt: new Date(),
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

    return new UserResponseDto(updatedUser);
  }

  async changePassword(
    userId: number,
    passwordData: ChangePasswordPayload,
  ): Promise<void> {
    const { currentPassword, newPassword } = passwordData;

    // 현재 사용자 정보 조회
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 해싱
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 비밀번호 업데이트
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date(),
      },
    });
  }

  async getUserById(userId: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return new UserResponseDto(user);
  }

  async deleteUser(userId: number): Promise<void> {
    // 사용자 존재 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 관련 데이터와 함께 사용자 삭제 (Cascade로 자동 삭제됨)
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        coinBalance: true,
        penaltyCount: true,
        createdAt: true,
        lastLoginAt: true,
        posts: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const totalPosts = user.posts.length;
    const daysSinceJoin = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      coinBalance: user.coinBalance,
      penaltyCount: user.penaltyCount,
      totalPosts,
      daysSinceJoin,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
