const PATHS = {
    HOME: '/',
    AUTH: {
        LOGIN: '/login',
        REGISTER: '/register',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        ACTIVATE: '/activate',
    },
    COMPANY: {
        REGISTER: '/company/registration',
        PROFILE: '/company/profile',
        MANAGE: {
            INDEX: '/company/manage',
            EMPLOYEES: '/company/manage/employees',
            DEPARTMENTS: '/company/manage/departments',
        },

        TERMINATEEMPLOYEE: '/company/terminateemployee',
        REHIRE: '/company/rehire',
        DOCUMENTLIST: '/company/transferknowledge/:employeeId',
        FINAL_SETTLEMENT: '/company/settlement/:employeeId'
    },
    DASHBOARD: {
        INDEX: '/dashboard',
    },
    USER: {
        INDEX: '/user',
        PROFILE: '/user/profile',
        SETTING: '/user/setting',
        INBOX: '/user/inbox',
    },
    EMPLOYEE: {
        INDEX: '/employee',
        ADD: '/employee/add',
        EDIT: {
            PATH: '/employee/:id/edit',
            URL: function (id) {
                return `/employee/${id}/edit`;
            },
        },
        PROFILE: '/employee/profile',
    },
    FORM: {
        INDEX: '/form',
        EDIT: {
            PATH: '/form/:id',
            URL: function (id) {
                return `/form/${id}`;
            },
        },
        LIST: '/form/list',
        ANSWER: {
            PATH: '/form/:id/answer',
            URL: function (id) {
                return `/form/${id}/answer`;
            },
        },
        PREVIEW: {
            PATH: '/form/:id/preview',
            URL: function (id) {
                return `/form/${id}/preview`;
            },
        },
        FEEDBACK: {
            PATH: '/form/:id/feedback',
            URL: function (id) {
                return `/form/${id}/feedback`;
            },
        },
        PUBLISH: '/form/publish',
    },
    JOB: {
        INDEX: '/job',
        CREATE: '/job/create',
        EDIT: {
            PATH: '/job/:id/edit',
            URL: function (id) {
                return `/job/${id}/edit`;
            },
        },
        POSTING: {
            PATH: '/job/:id/posting',
            URL: function (id) {
                return `/job/${id}/posting`;
            },
        },
        LIST: '/job/list',
        FILTER: '/job/filter',
        EXAMPLE: '/job/example',
        TRANSFER_DOCUMENT: '/job/transferdocument',
    },
    APPLICATION: {
        MANAGE: {
            PATH: '/application/:id',
            URL: function (id) {
                return `/application/${id}`;
            },
        },
        HISTORY: '/application/history',
    },
    MONITOR: {
        INDEX: '/monitor',
    },
    ANALYTIC: {
        TURNOVER: '/analytic/turnover',
    },
    RESUME: {
        INDEX: '/resume',
        CREATE: '/resume/create',
        EDIT: {
            PATH: '/resume/:id/edit',
            URL: function (id) {
                return `/resume/${id}/edit`;
            },
        },
        LIST: '/resume/list',
        DELETE: {
            PATH: '/resume/:id/delete',
            URL: function (id) {
                return `/resume/${id}/delete`;
            },
        },
    },
    TICKET: {
        INDEX: '/applicant/tickets',
        SUBMIT: '/applicant/tickets/submit',
        ALL: '/tickets',
        VIEW: {
            PATH: '/tickets/:id',
            URL: function (id) {
                return `/tickets/${id}`;
            },
        },
        UPDATE: {
            PATH: '/tickets/:id/update',
            URL: function (id) {
                return `/tickets/${id}/update`;
            },
        },
    },
};

export default PATHS;
