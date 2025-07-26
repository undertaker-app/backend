import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ description: '사용자 ID', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: '이메일', example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: '닉네임', example: '지하철왕' })
  @Expose()
  nickname: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-1234-5678',
    required: false,
  })
  @Expose()
  phoneNumber?: string;

  @ApiProperty({ description: '코인 잔액', example: 1000 })
  @Expose()
  coinBalance: number;

  @ApiProperty({ description: '신고 누적 횟수', example: 0 })
  @Expose()
  penaltyCount: number;

  @ApiProperty({ description: '계정 정지 여부', example: false })
  @Expose()
  isBanned: boolean;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  @Expose()
  profileImageUrl?: string;

  @ApiProperty({ description: '마지막 로그인 시간', required: false })
  @Expose()
  lastLoginAt?: Date;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: '계정 수정일',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  // 비밀번호는 응답에서 제외
  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class LoginResponseDto {
  @ApiProperty({
    description: '액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({ description: '사용자 정보', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: '토큰 만료 시간 (초)', example: 900 })
  expiresIn: number;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: '새로운 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ description: '토큰 만료 시간 (초)', example: 900 })
  expiresIn: number;
}
