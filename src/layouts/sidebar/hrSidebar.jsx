import PATHS from '@constants/routes/paths';
import { SvgIcon } from '@mui/material';
import HomeSmileIcon from '../../icons/untitled-ui/duocolor/home-smile';
import SupportIcon from '@mui/icons-material/SupportAgent';

const hrSection = [
    {
        items: [
            {
                title: 'Dashboard',
                path: PATHS.DASHBOARD.INDEX,
                icon: (
                    <SvgIcon fontSize="small">
                        <HomeSmileIcon />
                    </SvgIcon>
                ),
            },
            {
                subheader: 'Forms',
                title: 'Forms',
                items: [
                    {
                        title: 'Manage',
                        path: PATHS.FORM.INDEX,
                    },
                ],
            },
            {
                title: 'Company',
                items: [
                    {
                        title: 'Profile',
                        path: PATHS.COMPANY.PROFILE,
                    },
                ],
            },
            {
                title: 'Employees',
                items: [
                    {
                        title: 'Manage Employees',
                        path: PATHS.COMPANY.MANAGE.EMPLOYEES,
                    },
                    {
                        title: 'Terminate Employee',
                        path: PATHS.COMPANY.TERMINATEEMPLOYEE,
                    },
                    {
                        title: 'Rehire Employees',
                        path: PATHS.COMPANY.REHIRE,
                    },
                ],
            },
            {
                title: 'Job',
                items: [
                    {
                        title: 'List Job',
                        path: PATHS.JOB.LIST,
                    },
                    {
                        title: 'Create Job',
                        path: PATHS.JOB.CREATE,
                    },
                ],
            },
            {
                title: 'Analytic',
                items: [
                    {
                        title: 'Turnover',
                        path: PATHS.ANALYTIC.TURNOVER,
                    },
                ],
            },
            {
                title: 'Support Tickets',
                path: PATHS.TICKET.ALL,
                icon: (
                    <SvgIcon fontSize="small">
                        <SupportIcon />
                    </SvgIcon>
                ),
            },
        ],
    },
];

export default hrSection;
