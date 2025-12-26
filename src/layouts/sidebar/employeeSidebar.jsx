import HomeSmileIcon from '../../icons/untitled-ui/duocolor/home-smile';
import PATHS from '@constants/routes/paths';
import { SvgIcon } from '@mui/material';
import SupportIcon from '@mui/icons-material/SupportAgent';

const employeeSection = [
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
                subheader: 'Job Application',
                title: 'Job Application',
                items: [
                    {
                        title: 'Browse',
                        path: PATHS.JOB.INDEX,
                    },
                    {
                        title: 'History',
                        path: PATHS.APPLICATION.HISTORY,
                    },
                    // {
                    //     title: 'Example',
                    //     path: PATHS.JOB.EXAMPLE,
                    // },
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
                subheader: 'Forms',
                title: 'Forms',
                items: [
                    {
                        title: 'Fill Form',
                        path: PATHS.FORM.PUBLISH,
                    },
                ],
            },
            {
                title: 'Transfer Document',
                path: PATHS.JOB.TRANSFER_DOCUMENT,
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

export default employeeSection;
