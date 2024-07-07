import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('shows')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'MANAGER'])
  async create(@Body() createShowDto: CreateShowDto) {
    const createdShow = await this.showService.create(createShowDto);
    return {
      message: '공연 정보를 등록했습니다.',
      data: createdShow,
    };
  }

  @Get()
  async findAll() {
    return this.showService.findAll();
  }

  @Get(':showId')
  async findOne(@Param('showId') showId: string) {
    return this.showService.findOne(Number(showId));
  }

  @Patch(':showId')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'MANAGER'])
  async update(@Param('showId') showId: string, @Body() updateShowDto: UpdateShowDto) {
    await this.showService.update(Number(showId), updateShowDto);
    return {
      message: '공연 정보를 수정했습니다.',
      data: { showId: Number(showId) },
    };
  }

  @Delete(':showId')
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN', 'MANAGER'])
  async remove(@Param('showId') showId: string) {
    await this.showService.remove(Number(showId));
    return {
      message: '공연 정보를 삭제했습니다.',
      data: { showId: Number(showId) },
    };
  }
}
