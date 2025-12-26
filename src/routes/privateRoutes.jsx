import { Route } from 'react-router-dom';
import ProtectedRoute from '@utils/protectedRoute';
import { PrivateLayout } from '@layouts/private';
import PATHS from '@constants/routes/paths';
import * as Form from '@pages/forms';
import FormTab from '@pages/forms/form/components/tab';
import * as Company from '@pages/company';
import * as User from '@pages/user';
import * as Job from '@pages/job';
import * as Admin from '@pages/admin';
import SubmitTicket from '@pages/ticket/SubmitTicket';
import ViewTicketStatus from '@pages/ticket/ViewTicketStatus';
import MyTickets from '@pages/ticket/MyTickets';
import UpdateTicket from '@pages/ticket/UpdateTicket';
import AllTickets from '@pages/ticket/AllTickets';
import TicketReport from '@pages/ticket/TicketReport';

const privateRoutes = (
    <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
            <Route path={PATHS.DASHBOARD.INDEX} element={<User.Dashboard />} />

            <Route>
                <Route path={PATHS.FORM.INDEX} element={<Form.ManageForm />} />
                <Route element={<FormTab />}>
                    <Route path={PATHS.FORM.EDIT.PATH} element={<Form.EditForm />} />
                    <Route path={PATHS.FORM.PREVIEW.PATH} element={<Form.AnswerForm disabled={true} />} />
                    <Route path={PATHS.FORM.FEEDBACK.PATH} element={<Form.Feedback />} />
                </Route>
                <Route path={PATHS.FORM.PUBLISH} element={<Form.PublishForm />} />
                <Route path={PATHS.FORM.ANSWER.PATH} element={<Form.AnswerForm />} />
            </Route>

            <Route>
                <Route path={PATHS.COMPANY.MANAGE.EMPLOYEES} element={<Company.Employees />} />
                <Route path={PATHS.COMPANY.MANAGE.DEPARTMENTS} element={<Company.Departments />} />
                <Route path={PATHS.COMPANY.MANAGE.INDEX} element={<Company.ManageCompany />} />
                <Route path={PATHS.COMPANY.PROFILE} element={<Company.ProfileCompany />} />

                <Route path={PATHS.COMPANY.TERMINATEEMPLOYEE} element={<Company.TerminateEmployee />} />
                <Route path={PATHS.COMPANY.REHIRE} element={<Company.Rehire />} />

            </Route>

            <Route>
                <Route path={PATHS.USER.PROFILE} element={<User.Account tabValue="profile" />} />
                <Route path={PATHS.USER.SETTING} element={<User.Account tabValue="setting" />} />
                <Route path={PATHS.USER.INBOX} element={<User.Inbox />} />
            </Route>

            <Route>
                <Route path={PATHS.JOB.CREATE} element={<Job.CreateJob />} />
                <Route path={PATHS.JOB.LIST} element={<Job.ListJob />} />
                <Route path={PATHS.JOB.INDEX} element={<Job.Browse />} />
                <Route path={PATHS.JOB.EDIT.PATH} element={<Job.CreateJob />} />
                <Route path={PATHS.JOB.EXAMPLE} element={<Job.Example />} />
                <Route path={PATHS.JOB.TRANSFER_DOCUMENT} element={<Job.TransferDocument />} /> 
            </Route>

            <Route>
                <Route path={PATHS.APPLICATION.MANAGE.PATH} element={<Job.Application />} />
                <Route path={PATHS.APPLICATION.HISTORY} element={<Job.History />} />
            </Route>

            <Route>
                <Route path={PATHS.MONITOR.INDEX} element={<Admin.Monitor />} />
            </Route>

            <Route>
                <Route path={PATHS.ANALYTIC.TURNOVER} element={<Company.TurnOver />} />
                <Route path={PATHS.COMPANY.DOCUMENTLIST} element={<Company.TransferKnowledge />} />
                <Route path={PATHS.COMPANY.FINAL_SETTLEMENT} element={<Company.FinalSettlement />} />
            </Route>

            <Route>
                <Route path={PATHS.TICKET.INDEX} element={<MyTickets />} />
                <Route path={PATHS.TICKET.SUBMIT} element={<SubmitTicket />} />
                <Route path={PATHS.TICKET.VIEW.PATH} element={<ViewTicketStatus />} />
                <Route path={PATHS.TICKET.UPDATE.PATH} element={<UpdateTicket />} />
                <Route path={PATHS.TICKET.ALL} element={<AllTickets />} />
                <Route path={PATHS.TICKET.REPORT} element={<TicketReport />} />
            </Route>
        </Route>
    </Route>
);

export default privateRoutes;
