export const isAuthenticated = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

export const login = (email, password) => {
  // Accept any email/password combination
  if (email && password) {
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userEmail", email)
    localStorage.setItem("userRole", email.includes("admin") ? "admin" : "user")
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("userName")
  localStorage.removeItem("userRole")
}

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null

  const isAuth = localStorage.getItem("isAuthenticated")
  if (isAuth !== "true") return null

  return {
    email: localStorage.getItem("userEmail"),
    name: localStorage.getItem("userName") || "User",
    role: localStorage.getItem("userRole") || "user",
  }
}
