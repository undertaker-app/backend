import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserPayload } from './dto/update-user.payload';
import { ChangePasswordPayload } from './dto/change-password.payload';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('사용자 관리 (Users)')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiSuccessResponse(UserResponseDto, '사용자 정보 수정 성공')
  @ApiErrorResponse(409, '이미 사용중인 닉네임')
  @ApiErrorResponse(401, '인증 실패')
  @ApiErrorResponse(400, '입력값 검증 실패')
  async updateMe(@User() user: any, @Body() updateData: UpdateUserPayload) {
    const updatedUser = await this.usersService.updateUser(user.id, updateData);
    return {
      success: true,
      message: '사용자 정보가 수정되었습니다.',
      data: updatedUser,
    };
  }

  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiSuccessResponse(undefined, '비밀번호 변경 성공')
  @ApiErrorResponse(401, '현재 비밀번호 오류 또는 인증 실패')
  @ApiErrorResponse(400, '입력값 검증 실패')
  async changePassword(
    @User() user: any,
    @Body() passwordData: ChangePasswordPayload,
  ) {
    await this.usersService.changePassword(user.id, passwordData);
    return {
      success: true,
      message: '비밀번호가 변경되었습니다.',
    };
  }

  @Get('me/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 활동 통계 조회' })
  @ApiSuccessResponse(undefined, '활동 통계 조회 성공')
  @ApiErrorResponse(401, '인증 실패')
  async getMyStats(@User() user: any) {
    const stats = await this.usersService.getUserStats(user.id);
    return {
      success: true,
      message: '활동 통계를 조회했습니다.',
      data: stats,
    };
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiSuccessResponse(undefined, '회원 탈퇴 성공')
  @ApiErrorResponse(401, '인증 실패')
  async deleteMe(@User() user: any) {
    await this.usersService.deleteUser(user.id);
    return {
      success: true,
      message: '회원 탈퇴가 완료되었습니다.',
    };
  }
}
