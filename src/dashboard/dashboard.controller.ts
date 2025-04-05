import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../shared/helpers/apiresponse';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private dashboardService: DashboardService
    ){}

    @Get()
    async getDashboardData(){
        const res = await this.dashboardService.getDashoard();
        return ApiResponse.success("Dashboard data fetched successfully", res);
    }
}

