import { getRequest, postRequest, patchRequest, deleteRequest } from '@/lib/httpClient'

export const adminService = {
    // ── Users (Generic Admin) ───────────────────────────────────────────────

    /** Get users list with pagination and filters */
    getUsers: (userType: string, params: Record<string, string | number>) =>
        getRequest('/admin/users/', { ...params, user_type: userType }),

    /** Get user statistics */
    getUserStats: (userType: string) =>
        getRequest('/admin/users/stats', { user_type: userType }),

    /** Get a single user by id */
    getUser: (userId: string) => getRequest(`/admin/users/${userId}`),

    /** Create a new user */
    createUser: (userType: string, data: Record<string, unknown>) =>
        postRequest('/admin/users/', { ...data, user_type: userType }),

    /** Update an existing user */
    updateUser: (userId: string, data: Record<string, unknown>) =>
        patchRequest(`/admin/users/${userId}`, data),

    /** Delete a user */
    deleteUser: (userId: string) => deleteRequest(`/admin/users/${userId}`),

    // ── Students ─────────────────────────────────────────────────────────────

    /** Get students list with pagination and filters */
    getStudents: (params: Record<string, string | number>) => 
        adminService.getUsers('student', params),

    /** Get student statistics */
    getStudentStats: () => adminService.getUserStats('student'),

    /** Get a single student by id */
    getStudent: (studentId: string) => adminService.getUser(studentId),

    /** Create a new student */
    createStudent: (data: Record<string, unknown>) => 
        adminService.createUser('student', data),

    /** Update an existing student */
    updateStudent: (studentId: string, data: Record<string, unknown>) => 
        adminService.updateUser(studentId, data),

    /** Delete a student */
    deleteStudent: (studentId: string) => 
        adminService.deleteUser(studentId)
}
