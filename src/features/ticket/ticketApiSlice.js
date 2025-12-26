import { apiSlice } from '../../store/api/apiSlice';

export const ticketApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        submitTicket: builder.mutation({
            query: (formData) => ({
                url: '/tickets',
                method: 'POST',
                body: formData,
                // Don't set Content-Type for FormData, browser will set it automatically with boundary
            }),
            invalidatesTags: ['Ticket'],
        }),
        getUserTickets: builder.query({
            query: (userId) => `/tickets/user/${userId}`,
            providesTags: ['Ticket'],
        }),
        getTicketById: builder.query({
            query: (ticketId) => `/tickets/${ticketId}`,
            providesTags: (result, error, ticketId) => [{ type: 'Ticket', id: ticketId }],
        }),
        getAllTickets: builder.query({
            query: ({ status, priority, category } = {}) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                if (priority) params.append('priority', priority);
                if (category) params.append('category', category);
                const queryString = params.toString();
                return `/tickets${queryString ? `?${queryString}` : ''}`;
            },
            providesTags: ['Ticket'],
        }),
        updateTicket: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/tickets/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }, 'Ticket'],
        }),
        closeTicket: builder.mutation({
            query: (id) => ({
                url: `/tickets/${id}/close`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Ticket', id }, 'Ticket'],
        }),
        generateTicketReport: builder.mutation({
            query: (filters) => ({
                url: '/tickets/report/generate',
                method: 'POST',
                body: filters,
            }),
        }),
    }),
});

export const {
    useSubmitTicketMutation,
    useGetUserTicketsQuery,
    useGetTicketByIdQuery,
    useGetAllTicketsQuery,
    useUpdateTicketMutation,
    useCloseTicketMutation,
    useGenerateTicketReportMutation,
} = ticketApiSlice;

