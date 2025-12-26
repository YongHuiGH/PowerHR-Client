import PropTypes from 'prop-types';
import { Layout } from './layout';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { adminSection, applicantSection, employeeSection, hrSection, systemAdminSection } from '@layouts/sidebar';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

//Checks whether the employee is terminated
//If the employee is in termination process, it will display the transfer document side bar.
const filterEmployeeSection = (sections, user) => {
    if (!user.terminationDate || dayjs(user.terminationDate).isBefore(dayjs())) {
        const filterItems = (items) => {
            return items
                .filter((item) => item.title !== 'Transfer Document')
                .map((item) => {
                    if (item.items) {
                        // Recursively filter nested items
                        return { ...item, items: filterItems(item.items) };
                    }
                    return item;
                });
            };

        return sections.map((section) => ({
            ...section,
            items: filterItems(section.items),
        }));
    }
    return sections;
};

const getSections = (user) => {
    const role = user.role?.toLowerCase();
    
    if (role === 'applicant') {
        return applicantSection;
    } else if (role === 'admin') {
        return adminSection;
    } else if (role === 'sysadmin') {
        return systemAdminSection;
    } else if (role === 'hr') {
        return hrSection;
    } else {
        return filterEmployeeSection(employeeSection, user);
    }
};

export const PrivateLayout = (props) => {
    const { user } = useSelector((state) => state.auth);
    const sections = useMemo(() => {
        const baseSections = getSections(user);
        return baseSections;
    }, [user]);
    return <Layout sections={sections} navColor="evident" {...props} />;
};

Layout.propTypes = {
    children: PropTypes.node,
};
