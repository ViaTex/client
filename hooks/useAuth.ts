import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserType } from '@/types/auth'
import { authService } from '@/services/auth.service'

export interface User {
    id: string
    email: string
    user_type: UserType
    name?: string
    profile_picture_url?: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = () => {
        try {
            const accessToken = localStorage.getItem('access_token')
            const refreshToken = localStorage.getItem('refresh_token')

            if (accessToken && refreshToken) {
                if (accessToken === 'temp-access-token' && refreshToken === 'temp-refresh-token') {
                    const tempUserData = localStorage.getItem('temp_user_data')
                    if (tempUserData) {
                        try {
                            const parsedUser = JSON.parse(tempUserData)
                            setUser(parsedUser)
                            setIsAuthenticated(true)
                        } catch (error) {
                            setIsAuthenticated(false)
                            setUser(null)
                        }
                    } else {
                        setIsAuthenticated(false)
                        setUser(null)
                    }
                    setIsLoading(false)
                    return
                }

                try {
                    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
                    const currentTime = Date.now() / 1000

                    if (tokenPayload.exp > currentTime) {
                        const userData = localStorage.getItem('user_data')
                        if (userData) {
                            const parsedUser = JSON.parse(userData)
                            setUser(parsedUser)
                            setIsAuthenticated(true)
                        } else {
                            const userFromToken: User = {
                                id: tokenPayload.sub || 'temp-id',
                                email: tokenPayload.email || '',
                                user_type: tokenPayload.user_type || 'student',
                                name: tokenPayload.name || '',
                                profile_picture_url: tokenPayload.profile_picture_url || ''
                            }
                            setUser(userFromToken)
                            setIsAuthenticated(true)
                            localStorage.setItem('user_data', JSON.stringify(userFromToken))
                        }
                    } else {
                        logout()
                    }
                } catch (error) {
                    logout()
                }
            } else {
                setIsAuthenticated(false)
                setUser(null)
            }
        } catch (error) {
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = (userData: User, accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)
    }

    const logout = async () => {
        try {
            // Notify the backend (best-effort; don't block user logout if it fails)
            await authService.logout()
        } catch (e) {
            // Ignore errors — we still clear local state
        } finally {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user_data')
            localStorage.removeItem('temp_user_data')
            localStorage.removeItem('temp_user_type')
            setUser(null)
            setIsAuthenticated(false)
            router.push('/auth/login')
        }
    }

    const redirectIfAuthenticated = () => {
        if (isAuthenticated && user) {
            const dashboardPath = `/dashboard/${user.user_type}`
            router.push(dashboardPath)
            return true
        }
        return false
    }

    const requireAuth = (redirectPath: string = '/auth/login') => {
        if (!isAuthenticated) {
            router.push(redirectPath)
            return false
        }
        return true
    }

    const getToken = () => {
        return localStorage.getItem('access_token')
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        redirectIfAuthenticated,
        requireAuth,
        checkAuthStatus,
        getToken
    }
}
