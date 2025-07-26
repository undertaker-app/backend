import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  Matches,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class UpdateUserPayload {
  @ApiProperty({
    description: '닉네임 (최대 50자)',
    example: '새로운지하철왕',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '닉네임은 최대 50자까지 가능합니다.' })
  nickname?: string;

  @ApiProperty({
    description: '전화번호',
    example: '010-9876-5432',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^010-\d{4}-\d{4}$/, {
    message: '전화번호 형식이 올바르지 않습니다. (010-XXXX-XXXX)',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '올바른 URL 형식이 아닙니다.' })
  profileImageUrl?: string;
}
