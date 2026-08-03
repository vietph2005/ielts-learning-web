// import { useEffect, useState } from "react"
// import type { User, AuthContextType } from "@/types/apiTypes"
// import * as authService from "@/services/authService"
//
// export function useAuthState(): AuthContextType {
//     const [user, setUser] = useState<User | null>(null)
//
//     useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const data = await authService.getMe()
//                 if (data) {
//                     setUser({ username: data.username, role: data.role })
//                 } else {
//                     setUser(null)
//                 }
//             } catch {
//                 setUser(null)
//             }
//         }
//
//         fetchUser()
//     }, [])
//
//     const login = async (email: string, password: string) => {
//         await authService.login(email, password)
//         const data = await authService.getMe()
//         setUser({ username: data.username, role: data.role })
//     }
//
//     const logout = async () => {
//         await authService.logout()
//         setUser(null)
//     }
//
//     const register = async (email: string, password: string, role = "student") => {
//         await authService.register(email, password, role)
//     }
//
//     return {
//         user,
//         login,
//         logout,
//         register,
//     }
// }
