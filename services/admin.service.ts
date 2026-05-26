import { getRequest, postRequest, patchRequest, deleteRequest } from '@/lib/httpClient'

export const adminService = {
    // ── Students ─────────────────────────────────────────────────────────────

    /** Get students list with pagination and filters */
    getStudents: (params: Record<string, string | number>) => 
        getRequest('/admin/students/', { params }),

    /** Get student statistics */
    getStudentStats: () => getRequest('/admin/students/stats'),

    /** Get a single student by id */
    getStudent: (studentId: string) => getRequest(`/admin/students/${studentId}`),

    /** Create a new student */
    createStudent: (data: Record<string, unknown>) => 
        postRequest('/admin/students/', data),

    /** Update an existing student */
    updateStudent: (studentId: string, data: Record<string, unknown>) => 
        patchRequest(`/admin/students/${studentId}`, data),

    /** Delete a student */
    deleteStudent: (studentId: string) => 
        deleteRequest(`/admin/students/${studentId}`)
}
