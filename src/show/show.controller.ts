import { Controller, Get, Post, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ShowService } from './show.service';
import { CreateShowDto } from './dto/create-show.dto';
// import { UpdateShowDto } from './dto/update-show.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { ShowCategory } from './types/category.type';

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
  async findAll(@Query('category') category: ShowCategory | undefined, @Query('search') search: string | undefined) {
    return this.showService.findAll(category, search);
  }

  @Get(':showId')
  async findOne(@Param('showId', ParseIntPipe) showId: number) {
    return this.showService.findOne(showId);
  }

  // @Patch(':showId')
  // @UseGuards(AccessTokenGuard, RoleGuard)
  // @Roles(['ADMIN', 'MANAGER'])
  // async update(@Param('showId', ParseIntPipe) showId: number, @Body() updateShowDto: UpdateShowDto) {
  //   await this.showService.update(showId, updateShowDto);
  //   return {
  //     message: '공연 정보를 수정했습니다.',
  //     data: { showId },
  //   };
  // }

  // @Delete(':showId')
  // @UseGuards(AccessTokenGuard, RoleGuard)
  // @Roles(['ADMIN', 'MANAGER'])
  // async remove(@Param('showId', ParseIntPipe) showId: number) {
  //   await this.showService.remove(showId);
  //   return {
  //     message: '공연 정보를 삭제했습니다.',
  //     data: { showId },
  //   };
  // }
}
